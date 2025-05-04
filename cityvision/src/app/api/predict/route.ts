import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { businessType, rectangle } = await req.json();

  // Run your model logic here (you can offload to a server, Python API, etc.)
  // Dummy result
  const locations = [
    { lat: 26.4207, lng: 50.0888 }, // Central Dammam
    { lat: 26.4345, lng: 50.1031 }, // Near LuLu Mall
    { lat: 26.4088, lng: 50.0867 }, // Close to Al Rawdah
    { lat: 26.4161, lng: 50.0774 }, // Prince Mohammad Bin Fahd Stadium
    { lat: 26.4256, lng: 50.0921 }, // Dammam Medical Complex
  ];
  
  // 2. Create a prompt for GPT-4

  // to be changed - Jana 
  const prompt = `You are an assistant helping users choose optimal business locations in Dammam. Based on the selected business type "${businessType}", provide a brief summary of the factors that impact its success in that area.`;
  
  // 3. Call OpenAI
  let explanation = "";
  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });
  
    const data = await openaiRes.json();
    console.log("OpenAI Response:", data); // Log the response to debug
    if (data?.choices?.[0]?.message?.content) {
      //explanation = data.choices[0].message.content;
    } else {
      explanation = "";
    }
  } catch (error) {
    //console.error("OpenAI Error:", error);
  }
  


  return NextResponse.json({ locations, explanation });
}
