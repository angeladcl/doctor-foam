const https = require('https');

https.get('https://drfoam.com.mx/', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (data.includes('61583655190954')) {
      console.log('SUCCESS: Link found!');
    } else {
      console.log('NOT FOUND: Standard link is still there or site is not updated.');
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
