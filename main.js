const fs = require('fs');

async function extractTextFromPdf(filePath) {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    const data = fs.readFileSync(filePath);
    const uint8ArrayData = new Uint8Array(data);
    const pdf = await pdfjsLib.getDocument({ data: uint8ArrayData }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      const pageText = strings.join(' ');

      const dataRegex =  extractData(pageText)
      console.log('Name Match:', dataRegex.name);
      console.log('DOB Match:', dataRegex.dateOfBirth);

      const filteredScores = Object.fromEntries(
        Object.entries(dataRegex.scores).filter(([key, value]) => value !== undefined)

      
    );
    const totalScore = Object.values(filteredScores).reduce((acc, score) => {
      return acc + parseFloat(score);
  }, 0);
      console.log('Scores:', filteredScores);
      console.log(`Tổng điểm: ${totalScore}`);
      
    }
  } catch (error) {
    console.error('Lỗi khi đọc file PDF:', error);
  }
}

function extractData(data) {
    const nameMatch = data.match(/5. Nơi đăng ký thường trú: \s*([^\d]+)/);
    const dobMatch = data.match(/(\d{2}\/\d{2}\/\d{4})/);

    const specificScores = {
        'Toán': data.match(/Toán:\s*([\d.]+)/)?.[1],
        'Vật lí:': data.match(/Vật lí:\s*([\d.]+)/)?.[1],
        'Hóa học': data.match(/Hóa học:\s*([\d.]+)/)?.[1],
        'Ngữ văn': data.match(/Ngữ văn:\s*([\d.]+)/)?.[1],
        'Lịch sử:': data.match(/Lịch sử:\s*([\d.]+)/)?.[1],
        'Địa lí': data.match(/Địa lí:\s*([\d.]+)/)?.[1],
        'Ngoại ngữ': data.match(/Ngoại ngữ:\s*([\d.]+)/)?.[1],
    };

    return {
        name: nameMatch ? nameMatch[1].trim().split(' PHIẾU')[0] : null, // Chỉ lấy tên
        dateOfBirth: dobMatch ? dobMatch[1] : null,
        scores: {
            ...specificScores
        }
    };
};

const fileLocal = '/home/sdg258/Downloads/53_Tiền Giang_pxn.pdf';
extractTextFromPdf(fileLocal);