/**
 * Dynamically imports all images from the Marcas folder and sorts them.
 * You can control the order by naming your files with numbers:
 * Example: "01-logo.png", "02-another.png", etc.
 */
const modules = import.meta.glob('../imagenes/Marcas/*.{png,jpg,jpeg,svg,webp}', { eager: true });

// Convert to array and sort by filename
const sortedEntries = Object.entries(modules).sort((a, b) => {
    return a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' });
});

export const brands = sortedEntries.map(([path, module]) => {
    // Extract filename (e.g., "01-BONSAI-SUSHI" from "../imagenes/Marcas/01-BONSAI-SUSHI.png")
    const fileName = path.split('/').pop().split('.').shift();
    
    // Clean up name for alt text:
    // 1. Remove leading numbers and dashes (e.g., "01-" -> "")
    // 2. Replace hyphens/underscores with spaces
    // 3. Capitalize words
    const cleanName = fileName
        .replace(/^\d+[-_]*/, '') // Remove prefix numbers like "01-"
        .replace(/[_-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return {
        src: module.default || module,
        alt: cleanName
    };
});
