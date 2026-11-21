// Baut index.bundle.html: index.html mit eingebundenen Modulen (für Artefakt/Vorschau ohne Server).
// Start: node bauen.js
const fs=require('fs');let h=fs.readFileSync('index.html','utf8');
h=h.replace(/<script src="([a-z0-9_-]+\.js)"[^>]*><\/script>/gi,(m,f)=>{const c=fs.readFileSync(f,'utf8');if(/<\/script/i.test(c))throw new Error(f+' enthält </script');return '<script>\n'+c+'\n</script>'});
fs.writeFileSync('index.bundle.html',h);console.log('index.bundle.html gebaut');
