import { writeFile } from 'fs/promises';
import { join } from 'path';
import https from 'https';

const imageUrls = [
  'https://picsum.photos/800/400?random=1',
  'https://picsum.photos/800/400?random=2',
  'https://picsum.photos/800/400?random=3',
  'https://picsum.photos/800/400?random=4',
  'https://picsum.photos/800/400?random=5'
];

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            reject(new Error(`Failed to download image after redirect: ${redirectResponse.statusCode}`));
            return;
          }

          const data = [];
          redirectResponse.on('data', (chunk) => data.push(chunk));
          redirectResponse.on('end', () => {
            const buffer = Buffer.concat(data);
            resolve(buffer);
          });
        }).on('error', reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const data = [];
      response.on('data', (chunk) => data.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve(buffer);
      });
    }).on('error', reject);
  });
}

async function main() {
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      console.log(`Downloading image ${i + 1}...`);
      const imageData = await downloadImage(imageUrls[i]);
      const filename = join('playground', 'images', `demo${i + 1}.jpg`);
      await writeFile(filename, imageData);
      console.log(`Downloaded: demo${i + 1}.jpg`);
    } catch (error) {
      console.error(`Failed to download image ${i + 1}:`, error);
    }
  }
}

main().catch(console.error); 