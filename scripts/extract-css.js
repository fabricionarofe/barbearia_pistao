const fs = require('fs');

let page = fs.readFileSync('app/page.js', 'utf8');
const styleStart = page.indexOf('<style jsx global>');
const styleEnd = page.indexOf('</style>') + 8;

if (styleStart > -1) {
    const cssStart = page.indexOf('{`', styleStart) + 2;
    const cssEnd = page.lastIndexOf('`}', styleEnd);
    const css = page.substring(cssStart, cssEnd);

    fs.appendFileSync('app/globals.css', '\n\n/* Client UI Styles */\n' + css);
    
    // Remove the whole <style> tag chunk
    page = page.substring(0, styleStart) + page.substring(styleEnd + 1); // +1 to remove ending bracket if any
    
    // Clean up empty curly braces or fragments left behind
    page = page.replace(/\{?\}\s*$/, '');
    fs.writeFileSync('app/page.js', page);
    console.log('CSS Moved!');
}
