import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { parse } from 'json2csv';
import path from 'path';
import { spawn } from 'child_process';
import { FormData, fetch } from 'undici';
import { Blob } from 'buffer'; // ✅ FIX: Node.js Blob

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gridData, businessType } = body;

    if (!Array.isArray(gridData) || typeof businessType !== 'string') {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    const dataWithType = gridData.map((item: any, index: number) => ({
      id: index + 1,
      businessType,
      'center.lat': item.center.lat,
      'center.lng': item.center.lng,
      'bounds.north': item.bounds.north,
      'bounds.south': item.bounds.south,
      'bounds.east': item.bounds.east,
      'bounds.west': item.bounds.west,
    }));

    const fields = [
      'id',
      'businessType',
      'center.lat',
      'center.lng',
      'bounds.north',
      'bounds.south',
      'bounds.east',
      'bounds.west',
    ];
    const csv = parse(dataWithType, { fields });

    const dir = path.join(process.cwd(), 'public', 'exports');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const inputCsvPath = path.join(dir, 'potentialLocationsList.csv');
    writeFileSync(inputCsvPath, csv);

    // Run POI extraction script
    const outputCsvPath = path.join(dir, 'potentialLocations.csv');
    await new Promise((resolve, reject) => {
      const py = spawn('python', ['src/app/backend/scripts/poi_extraction.py', inputCsvPath, outputCsvPath]);
      py.stdout.on('data', (data) => console.log(`stdout: ${data}`));
      py.stderr.on('data', (data) => console.error(`stderr: ${data}`));
      py.on('close', (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(`Python script exited with code ${code}`));
      });
    });

    // Send file to Flask model
    const fileBuffer = readFileSync(inputCsvPath);
    const form = new FormData();
    form.append('file', new Blob([fileBuffer], { type: 'text/csv' }), 'potentialLocationsList.csv');

    const modelResponse = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      body: form,
    });

    if (!modelResponse.ok) {
      const errorText = await modelResponse.text();
      throw new Error(`Flask server returned ${modelResponse.status}: ${errorText}`);
    }

    const predictionResult = await modelResponse.json() as {
      top_locations: any[];
      generated_text: string // You can strongly type this if you know the structure
    };

    console.log('Flask model raw response:', predictionResult);
 
    return NextResponse.json({
      message: 'POIs and ranking completed',
      locationsPath: '/exports/potentialLocationsList.csv',
      poisPath: '/exports/potentialLocations.csv',
      topLocations: predictionResult.top_locations,
      generated_text: predictionResult.generated_text
    });

 

  } catch (error: any) {
    console.error('Pipeline error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
