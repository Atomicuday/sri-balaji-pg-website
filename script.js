document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== "#" && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if(target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 2. Dynamic Google Sheet Gallery
    const SHEET_ID = '1tQQ4jdCsNDgzPzUbRq9ixiuuYWXvmMYoad9b8awOxGE';
    const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/Sheet1`;

    const homeGallery = document.getElementById('gallery-container');
    const fullGallery = document.getElementById('full-gallery-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxIframe = document.getElementById('lightbox-iframe');

    function getDriveId(url) {
        if (!url) return null;
        const match = url.match(/\/d\/(.+?)\/(view|edit|preview)/) || url.match(/id=(.+?)(&|$)/);
        return match ? match[1] : null;
    }

    async function fetchGallery() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            if (data.length === 0) return;

            if (homeGallery) {
                homeGallery.innerHTML = '';
                data.slice(0, 3).forEach((item, index) => renderItem(item, index, homeGallery, true));
            }
            if (fullGallery) {
                fullGallery.innerHTML = '';
                data.forEach((item, index) => renderItem(item, index, fullGallery, false));
            }
        } catch (error) { console.error('Gallery Error:', error); }
    }

    function renderItem(item, index, container, isMosaic) {
        const rawUrl = item.MediaURL || item.mediaurl;
        const type = (item.MediaType || item.mediatype || "image").toLowerCase();
        const driveId = getDriveId(rawUrl);

        if (driveId) {
            const div = document.createElement('div');
            div.className = (isMosaic && index === 0) ? 'm-item tall' : 'm-item';
            if (type.includes('video')) {
                div.innerHTML = `<img src="https://lh3.googleusercontent.com/d/${driveId}" class="gallery-item"><div class="video-play-icon"><i class="fas fa-play-circle"></i></div>`;
                div.onclick = () => openLightbox(driveId, 'drive-video');
            } else {
                const src = `https://lh3.googleusercontent.com/d/${driveId}`;
                div.innerHTML = `<img src="${src}" class="gallery-item" loading="lazy">`;
                div.onclick = () => openLightbox(src, 'img');
            }
            container.appendChild(div);
        }
    }

    window.openLightbox = (source, mode) => {
        lightbox.style.display = 'flex';
        lightboxImg.style.display = 'none';
        lightboxIframe.style.display = 'none';
        if (mode === 'img') { lightboxImg.style.display = 'block'; lightboxImg.src = source; } 
        else { lightboxIframe.style.display = 'block'; lightboxIframe.src = `https://drive.google.com/file/d/${source}/preview`; }
    };

    window.closeLightbox = () => { lightbox.style.display = 'none'; lightboxIframe.src = ""; };
    if(lightbox) lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };

    fetchGallery();

    function updateGate() {
        const now = new Date();
        const hr = now.getHours();
        const statusText = document.querySelector('#gateCloseCard .gate-card-value');
        const card = document.getElementById('gateCloseCard');
        if (statusText && card) {
            if (hr >= 23 || hr < 6) { card.style.background = "#555"; statusText.innerText = "Closed Now"; } 
            else { card.style.background = "var(--saffron)"; statusText.innerText = "11:00 PM Close"; }
        }
    }
    updateGate();
});