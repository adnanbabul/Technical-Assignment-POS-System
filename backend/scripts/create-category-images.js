const fs = require('fs');
const path = require('path');

// Create SVG placeholder images for categories
const categories = [
  { file: 'chicken.png', name: 'Chicken', icon: '🍗', color: '#FF6B6B' },
  { file: 'seafood.png', name: 'Seafood', icon: '🦞', color: '#4ECDC4' },
  { file: 'pasta.png', name: 'Pasta', icon: '🍝', color: '#FFD93D' },
  { file: 'rice-bowl.png', name: 'Rice Bowl', icon: '🍚', color: '#95E1D3' },
];

const uploadsDir = path.join(__dirname, '..', 'uploads', 'categories');

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

categories.forEach(category => {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="${category.color}"/>
  <text x="200" y="150" font-family="Arial, sans-serif" font-size="80" text-anchor="middle">
    ${category.icon}
  </text>
  <text x="200" y="250" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" font-weight="bold">
    ${category.name}
  </text>
  <text x="200" y="290" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.8">
    Category
  </text>
</svg>`;

  const filePath = path.join(uploadsDir, category.file);
  fs.writeFileSync(filePath, svgContent);
  console.log(`✓ Created: ${category.file}`);
});

console.log(`\n✅ Successfully created ${categories.length} category placeholder images!`);
