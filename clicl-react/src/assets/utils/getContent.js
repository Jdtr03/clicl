/**
 * Dynamically imports all images from the imagenes_contenido folder.
 */
const imageModules = import.meta.glob('../imagenes/imagenes_contenido/*.{png,jpg,jpeg,svg,webp,PNG,JPG,JPEG}', { eager: true });
const videoWebmModules = import.meta.glob('../imagenes/videos_contenido/*.{webm,ogg,mov,MOV}', { eager: true });
const videoMp4Modules = import.meta.glob('../imagenes/videos_contenido/mp4/*.mp4', { eager: true });
const videoPosters = import.meta.glob('../imagenes/videos_contenido/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG}', { eager: true });

const processModules = (modules, posters = null) => {
    const sortedEntries = Object.entries(modules).sort((a, b) => {
        return a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' });
    });

    return sortedEntries.map(([path, module]) => {
        const fileName = path.split('/').pop().split('.').shift();
        
        let posterUrl = null;
        if (posters) {
            const posterPath = Object.keys(posters).find(p => p.includes(fileName));
            if (posterPath) {
                posterUrl = posters[posterPath].default || posters[posterPath];
            }
        }

        return {
            url: module.default || module,
            fileName: fileName,
            poster: posterUrl,
            title: fileName
                .replace(/Copy of /g, '')
                .replace(/^\d+[-_]*/, '')
                .replace(/[_-]/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' '),
            category: 'Producción'
        };
    });
};

export const contentImages = processModules(imageModules);

const webmVideos = processModules(videoWebmModules, videoPosters);
export const contentVideos = webmVideos.map(video => {
    const mp4Path = Object.keys(videoMp4Modules).find(p => p.includes(video.fileName));
    const mp4Url = mp4Path ? (videoMp4Modules[mp4Path].default || videoMp4Modules[mp4Path]) : null;
    return {
        ...video,
        urlMp4: mp4Url
    };
});

