const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', (err) => { fs.unlink(dest, () => reject(err)); });
  });
};

async function run() {
  console.log('Starting downloads...');
  try {
    await download('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Official_Portrait_of_Prime_Minister_Narendra_Modi_Cropped.jpg/400px-Official_Portrait_of_Prime_Minister_Narendra_Modi_Cropped.jpg', path.join(__dirname, 'public', 'modi.jpg'));
    console.log('Modi downloaded');
    await download('https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Mr._Eknath_Sambhaji_Shinde.jpg/400px-Mr._Eknath_Sambhaji_Shinde.jpg', path.join(__dirname, 'public', 'shinde.jpg'));
    console.log('Shinde downloaded');
    await download('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Devendra_Fadnavis_official_portrait.jpg/400px-Devendra_Fadnavis_official_portrait.jpg', path.join(__dirname, 'public', 'fadnavis.jpg'));
    console.log('Fadnavis downloaded');
    await download('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Seal_of_Maharashtra.svg/400px-Seal_of_Maharashtra.svg.png', path.join(__dirname, 'public', 'maha_logo.png'));
    console.log('Logo downloaded');
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
