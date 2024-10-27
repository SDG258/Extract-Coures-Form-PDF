const fs = require('fs');
const xlsx = require('xlsx');

async function extractTextFromPdf(filePath) {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    const data = fs.readFileSync(filePath);
    const uint8ArrayData = new Uint8Array(data);
    const pdf = await pdfjsLib.getDocument({ data: uint8ArrayData }).promise;

    const results = []; // Mảng để lưu kết quả

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      const pageText = strings.join(' ');

      const dataRegex = extractData(pageText);
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

      // Lưu kết quả vào mảng
      results.push({
        name: dataRegex.name,
        dateOfBirth: dataRegex.dateOfBirth,
        scores: filteredScores,
        totalScore: totalScore
      });
    }

    // Xuất dữ liệu ra file Excel
    exportToExcel(results);

  } catch (error) {
    console.error('Lỗi khi đọc file PDF:', error);
  }
}

function extractData(data) {
  const nameMatch = data.match(/5. Nơi đăng ký thường trú: \s*([^\d]+)/);
  const dobMatch = data.match(/(\d{2}\/\d{2}\/\d{4})/);

  const specificScores = {
    'Toán': data.match(/Toán:\s*([\d.]+)/)?.[1],
    'Vật lí': data.match(/Vật lí:\s*([\d.]+)/)?.[1],
    'Hóa học': data.match(/Hóa học:\s*([\d.]+)/)?.[1],
    'Ngữ văn': data.match(/Ngữ văn:\s*([\d.]+)/)?.[1],
    'Lịch sử': data.match(/Lịch sử:\s*([\d.]+)/)?.[1],
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
}

function exportToExcel(results) {
  // Tạo tiêu đề cho file Excel
  const data = [
    ['Họ tên', 'Năm sinh', 'Toán', 'Vật lí', 'Hóa học', ,'Ngoại ngữ', 'Ngữ văn', 'Lịch sử', 'Địa lý', 'Tổng điểm'],
  ];

  // Thêm dữ liệu vào mảng
  results.forEach(result => {
    data.push([
      result.name,
      result.dateOfBirth,
      result.scores['Toán'] || 0,
      result.scores['Vật lí'] || 0,
      result.scores['Hóa học'] || 0,
      result.scores['Ngoại ngữ'] || 0,
      result.scores['Ngữ văn'] || 0,
      result.scores['Lịch sử'] || 0,
      result.scores['Địa lí'] || 0,
      result.totalScore,
    ]);
  });

  // Tạo worksheet và workbook
  const worksheet = xlsx.utils.aoa_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Điểm');

  // Xuất file
  const filename = 'ket_qua.xlsx';
  xlsx.writeFile(workbook, filename);
}

// Sử dụng hàm
const fileLocal = '/home/sdg258/Downloads/53_Tiền Giang_pxn.pdf';
extractTextFromPdf(fileLocal);
