export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, page, context, content, fileData, fileName, fileType } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("DISCORD_WEBHOOK_URL is not set.");
      return res.status(200).json({ 
        success: true, 
        warning: 'LocalStorage saved, but Discord webhook is not configured on Vercel.' 
      });
    }

    let color = 3447003; // Blue
    let typeName = "質問";
    if (type === 'suggest') {
      color = 10181046; // Purple
      typeName = "提案";
    } else if (type === 'debug') {
      color = 15158332; // Red
      typeName = "バグ報告";
    } else if (type === 'donate') {
      color = 65280; // Green
      typeName = "問題寄贈";
    }

    const embed = {
      title: `📝 新しいフィードバック (${typeName})`,
      color: color,
      fields: [
        { name: "送信元ページ", value: page || "ポータルハブ", inline: true },
        { name: "コンテキスト", value: context || "なし", inline: true },
        { name: "内容", value: content }
      ],
      timestamp: new Date().toISOString()
    };

    if (fileName) {
      embed.fields.push({ name: "添付ファイル", value: fileName, inline: false });
    }

    let discordResponse;

    if (fileData && fileData.includes(';base64,')) {
      // Send as multipart/form-data to include file
      const base64Content = fileData.split(';base64,').pop();
      const buffer = Buffer.from(base64Content, 'base64');
      const blob = new Blob([buffer], { type: fileType || 'application/octet-stream' });
      
      const formData = new FormData();
      formData.append('payload_json', JSON.stringify({
        embeds: [embed]
      }));
      formData.append('files[0]', blob, fileName || 'file');

      discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        body: formData
      });
    } else {
      // Send as simple JSON
      discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          embeds: [embed]
        })
      });
    }

    if (!discordResponse.ok) {
      const errText = await discordResponse.text();
      return res.status(502).json({ error: `Discord Webhook returned: ${errText}` });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
