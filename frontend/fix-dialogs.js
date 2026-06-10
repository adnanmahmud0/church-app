const fs = require('fs');
const path = require('path');

const modules = [
  'sermons', 'prayer', 'history', 'giving', 
  'events', 'devotionals', 'community', 'watch-live'
];

const basePath = path.join(__dirname, 'src', 'app', '(admin)');

modules.forEach(mod => {
  const filePath = path.join(basePath, mod, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Add DialogTitle to import
  if (content.includes('@/components/ui/dialog') && !content.includes('DialogTitle')) {
    content = content.replace(
      /import\s+{[^}]*DialogContent[^}]*}\s+from\s+["']@\/components\/ui\/dialog["']/g, 
      match => match.replace('DialogContent', 'DialogContent, DialogTitle')
    );
    // If it's a multiline import without DialogTitle
    if (!content.includes('DialogTitle')) {
        content = content.replace(
            /DialogContent,/g,
            'DialogContent,\n  DialogTitle,'
        );
    }
    changed = true;
  }

  // Add <DialogTitle className="sr-only">Mobile App Preview</DialogTitle> after DialogContent
  const targetPattern = /<DialogContent className="sm:max-w-max bg-transparent border-none shadow-none p-0 flex justify-center \[\&>button\]:hidden">/g;
  
  if (content.match(targetPattern)) {
    const replacement = `<DialogContent className="sm:max-w-max bg-transparent border-none shadow-none p-0 flex justify-center [&>button]:hidden">\n          <DialogTitle className="sr-only">Mobile App Preview</DialogTitle>`;
    
    if (!content.includes('<DialogTitle className="sr-only">Mobile App Preview</DialogTitle>')) {
        content = content.replace(targetPattern, replacement);
        changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${mod}/page.tsx`);
  } else {
    console.log(`No changes needed for ${mod}/page.tsx`);
  }
});
