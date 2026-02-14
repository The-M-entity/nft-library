/* =============================================================================
   •M• NFT Library - Main Application
   ============================================================================= */

(function () {
    'use strict';

    // =========================================================================
    // State
    // =========================================================================
    let allNFTs = [];
    let filteredNFTs = [];
    let activeFilters = {
        collection: 'all',
        blockchain: 'all',
        tags: [],
        search: '',
        sort: 'newest'
    };
    let allTags = [];

    // =========================================================================
    // DOM References
    // =========================================================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const dom = {
        grid: $('#nftGrid'),
        noResults: $('#noResults'),
        loading: $('#loading'),
        searchInput: $('#searchInput'),
        clearSearch: $('#clearSearch'),
        sortSelect: $('#sortSelect'),
        tagsFilter: $('#tagsFilter'),
        tagButtons: $('#tagButtons'),
        resultsInfo: $('#resultsInfo'),
        themeToggle: $('#themeToggle'),
        contactForm: $('#contactForm'),
        formStatus: $('#formStatus'),
        // Stats
        statTotal: $('#statTotal'),
        statMVox: $('#statMVox'),
        statMNumeris: $('#statMNumeris'),
        statEthereum: $('#statEthereum'),
        statPolygon: $('#statPolygon'),
        // About
        aboutVision: $('#aboutVision'),
        aboutMission: $('#aboutMission'),
        lenidLink: $('#lenidLink')
    };

    // =========================================================================
    // Initialize
    // =========================================================================
    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        initTheme();
        await loadData();
        setupEventListeners();
        renderAll();
    }

    // =========================================================================
    // Data Loading
    // =========================================================================
    async function loadData() {
        try {
            // Load NFTs
            const nftResponse = await fetch('data/nfts.json');
            if (!nftResponse.ok) throw new Error('Failed to load NFTs');
            const rawData = await nftResponse.json();

            // Normalize: support both array format and single-object format
            if (Array.isArray(rawData)) {
                allNFTs = rawData;
            } else if (rawData && typeof rawData === 'object') {
                allNFTs = [rawData];
            } else {
                allNFTs = [];
            }

            // Filter only published NFTs
            allNFTs = allNFTs.filter(nft => nft.status !== 'draft');

            // Extract all unique tags
            const tagSet = new Set();
            allNFTs.forEach(nft => {
                if (nft.tags && Array.isArray(nft.tags)) {
                    nft.tags.forEach(tag => tagSet.add(tag));
                }
            });
            allTags = Array.from(tagSet).sort();

            // Load About data
            try {
                const aboutResponse = await fetch('data/about.json');
                if (aboutResponse.ok) {
                    const about = await aboutResponse.json();
                    if (about.vision && dom.aboutVision) dom.aboutVision.textContent = about.vision;
                    if (about.mission && dom.aboutMission) dom.aboutMission.textContent = about.mission;
                    if (about.lenid_url && dom.lenidLink) {
                        dom.lenidLink.href = about.lenid_url;
                        dom.lenidLink.style.display = 'inline-flex';
                    }
                }
            } catch (e) {
                // About data is optional
            }

        } catch (error) {
            console.error('Error loading data:', error);
            dom.loading.style.display = 'none';
            dom.grid.innerHTML = '<p style="text-align:center; padding:40px; color:var(--text-muted);">Erreur lors du chargement des données.</p>';
            return;
        }

        dom.loading.style.display = 'none';
    }

    // =========================================================================
    // Event Listeners
    // =========================================================================
    function setupEventListeners() {
        // Search
        dom.searchInput.addEventListener('input', debounce(handleSearch, 200));
        dom.clearSearch.addEventListener('click', clearSearch);

        // Collection filters
        $$('#collectionFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('#collectionFilters .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilters.collection = btn.dataset.value;
                renderAll();
            });
        });

        // Blockchain filters
        $$('#blockchainFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('#blockchainFilters .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilters.blockchain = btn.dataset.value;
                renderAll();
            });
        });

        // Sort
        dom.sortSelect.addEventListener('change', () => {
            activeFilters.sort = dom.sortSelect.value;
            renderAll();
        });

        // Theme toggle
        dom.themeToggle.addEventListener('click', toggleTheme);

        // Contact form
        if (dom.contactForm) {
            dom.contactForm.addEventListener('submit', handleContactSubmit);
        }

        // Close share dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.share-wrapper')) {
                $$('.share-dropdown.open').forEach(d => d.classList.remove('open'));
            }
        });

        // Smooth scroll for nav links
        $$('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = $(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    // =========================================================================
    // Rendering
    // =========================================================================
    function renderAll() {
        applyFilters();
        renderStats();
        renderTags();
        renderGrid();
        renderResultsInfo();
    }

    function renderStats() {
        const published = allNFTs;
        animateCounter(dom.statTotal, published.length);
        animateCounter(dom.statMVox, published.filter(n => n.collection === 'M-Vox').length);
        animateCounter(dom.statMNumeris, published.filter(n => n.collection === 'M-Numeris').length);
        animateCounter(dom.statEthereum, published.filter(n => n.blockchain === 'Ethereum').length);
        animateCounter(dom.statPolygon, published.filter(n => n.blockchain === 'Polygon').length);
    }

    function renderTags() {
        if (allTags.length === 0) {
            dom.tagsFilter.style.display = 'none';
            return;
        }

        dom.tagsFilter.style.display = 'block';
        dom.tagButtons.innerHTML = allTags.map(tag => {
            const isActive = activeFilters.tags.includes(tag);
            return `<button class="tag-btn${isActive ? ' active' : ''}" data-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`;
        }).join('');

        // Attach tag events
        dom.tagButtons.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                const idx = activeFilters.tags.indexOf(tag);
                if (idx > -1) {
                    activeFilters.tags.splice(idx, 1);
                } else {
                    activeFilters.tags.push(tag);
                }
                renderAll();
            });
        });
    }

    function renderGrid() {
        if (filteredNFTs.length === 0) {
            dom.grid.style.display = 'none';
            dom.noResults.style.display = 'block';
            return;
        }

        dom.grid.style.display = 'grid';
        dom.noResults.style.display = 'none';

        dom.grid.innerHTML = filteredNFTs.map(nft => createCardHTML(nft)).join('');

        // Attach card click events (download PDF)
        dom.grid.querySelectorAll('.nft-card').forEach(card => {
            const pdfUrl = card.dataset.pdf;
            const imageWrapper = card.querySelector('.nft-image-wrapper');

            // Click on image wrapper = download PDF
            if (imageWrapper && pdfUrl) {
                imageWrapper.addEventListener('click', (e) => {
                    e.stopPropagation();
                    downloadPDF(pdfUrl, card.dataset.title);
                });
            }
        });

        // Attach share button events
        dom.grid.querySelectorAll('.btn-share').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = btn.closest('.share-wrapper').querySelector('.share-dropdown');
                $$('.share-dropdown.open').forEach(d => {
                    if (d !== dropdown) d.classList.remove('open');
                });
                dropdown.classList.toggle('open');
            });
        });

        // Share options
        dom.grid.querySelectorAll('.share-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const title = btn.closest('.nft-card').dataset.title;
                handleShare(action, title);
                btn.closest('.share-dropdown').classList.remove('open');
            });
        });
    }

    function renderResultsInfo() {
        const total = allNFTs.length;
        const shown = filteredNFTs.length;
        if (total === shown) {
            dom.resultsInfo.textContent = `${total} NFT${total !== 1 ? 's' : ''} dans la bibliothèque`;
        } else {
            dom.resultsInfo.textContent = `${shown} sur ${total} NFT${total !== 1 ? 's' : ''}`;
        }
    }

    function createCardHTML(nft) {
        const tagsHTML = (nft.tags || []).map(tag =>
            `<span class="nft-tag">${escapeHTML(tag)}</span>`
        ).join('');

        const openseaBtn = nft.opensea_url
            ? `<a href="${escapeHTML(nft.opensea_url)}" target="_blank" rel="noopener" class="btn-action" onclick="event.stopPropagation();" title="Voir sur OpenSea">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                OpenSea
               </a>`
            : '';

        const dateFormatted = formatDate(nft.date);

        return `
        <article class="nft-card" data-pdf="${escapeHTML(nft.pdf || '')}" data-title="${escapeHTML(nft.title)}">
            <div class="nft-image-wrapper">
                <img
                    class="nft-image"
                    src="${escapeHTML(nft.image)}"
                    alt="${escapeHTML(nft.title)}"
                    loading="lazy"
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 fill=%22%231a2332%22%3E%3Crect width=%22400%22 height=%22400%22/%3E%3Ctext x=%22200%22 y=%22200%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2364748b%22 font-size=%2216%22 font-family=%22sans-serif%22%3EImage non disponible%3C/text%3E%3C/svg%3E'"
                >
                <div class="download-overlay">Cliquer pour télécharger le PDF</div>
            </div>
            <div class="nft-body">
                <div class="nft-meta-top">
                    <span class="collection-badge">${escapeHTML(nft.collection)}</span>
                    <span class="blockchain-badge">${escapeHTML(nft.blockchain)}</span>
                </div>
                <h3 class="nft-title">${escapeHTML(nft.title)}</h3>
                <p class="nft-description">${escapeHTML(nft.description_short || '')}</p>
                ${tagsHTML ? `<div class="nft-tags">${tagsHTML}</div>` : ''}
                <div class="nft-footer">
                    <span class="nft-date">${dateFormatted}</span>
                    <div class="nft-actions">
                        ${openseaBtn}
                        <div class="share-wrapper">
                            <button class="btn-action btn-share" title="Partager">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                Partager
                            </button>
                            <div class="share-dropdown">
                                <button class="share-option" data-action="twitter">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    X / Twitter
                                </button>
                                <button class="share-option" data-action="copy">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    Copier le lien
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>`;
    }

    // =========================================================================
    // Filtering & Sorting
    // =========================================================================
    function applyFilters() {
        let result = [...allNFTs];

        // Collection filter
        if (activeFilters.collection !== 'all') {
            result = result.filter(nft => nft.collection === activeFilters.collection);
        }

        // Blockchain filter
        if (activeFilters.blockchain !== 'all') {
            result = result.filter(nft => nft.blockchain === activeFilters.blockchain);
        }

        // Tags filter (AND logic - must match ALL selected tags)
        if (activeFilters.tags.length > 0) {
            result = result.filter(nft => {
                if (!nft.tags || !Array.isArray(nft.tags)) return false;
                return activeFilters.tags.every(tag => nft.tags.includes(tag));
            });
        }

        // Search
        if (activeFilters.search) {
            const term = activeFilters.search.toLowerCase();
            result = result.filter(nft =>
                (nft.title || '').toLowerCase().includes(term) ||
                (nft.description_short || '').toLowerCase().includes(term) ||
                (nft.description_full || '').toLowerCase().includes(term) ||
                (nft.collection || '').toLowerCase().includes(term) ||
                (nft.blockchain || '').toLowerCase().includes(term) ||
                (nft.tags || []).some(tag => tag.toLowerCase().includes(term))
            );
        }

        // Sort
        switch (activeFilters.sort) {
            case 'newest':
                result.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'alpha-az':
                result.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'fr'));
                break;
            case 'alpha-za':
                result.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'fr'));
                break;
        }

        filteredNFTs = result;
    }

    // =========================================================================
    // Search
    // =========================================================================
    function handleSearch() {
        const value = dom.searchInput.value.trim();
        activeFilters.search = value;
        dom.clearSearch.style.display = value ? 'block' : 'none';
        renderAll();
    }

    function clearSearch() {
        dom.searchInput.value = '';
        activeFilters.search = '';
        dom.clearSearch.style.display = 'none';
        renderAll();
        dom.searchInput.focus();
    }

    // Reset filters (called from "no results" button)
    window.resetFilters = function () {
        // Reset all filters
        activeFilters = {
            collection: 'all',
            blockchain: 'all',
            tags: [],
            search: '',
            sort: 'newest'
        };

        // Reset UI
        dom.searchInput.value = '';
        dom.clearSearch.style.display = 'none';
        dom.sortSelect.value = 'newest';

        $$('#collectionFilters .filter-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.value === 'all');
        });
        $$('#blockchainFilters .filter-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.value === 'all');
        });

        renderAll();
    };

    // =========================================================================
    // Download
    // =========================================================================
    function downloadPDF(url, title) {
        if (!url) return;
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // =========================================================================
    // Share
    // =========================================================================
    function handleShare(action, title) {
        const pageUrl = window.location.href;
        const text = `Découvrez "${title}" sur •M• NFT Library — Souveraineté numérique québécoise`;

        switch (action) {
            case 'twitter': {
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;
                window.open(twitterUrl, '_blank', 'width=600,height=400');
                break;
            }
            case 'copy': {
                navigator.clipboard.writeText(pageUrl).then(() => {
                    showToast('Lien copié !');
                }).catch(() => {
                    // Fallback
                    const input = document.createElement('input');
                    input.value = pageUrl;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    showToast('Lien copié !');
                });
                break;
            }
        }
    }

    // =========================================================================
    // Theme
    // =========================================================================
    function initTheme() {
        const saved = localStorage.getItem('m-nft-theme');
        const theme = saved || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('m-nft-theme', next);
    }

    // =========================================================================
    // Contact Form
    // =========================================================================
    function handleContactSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        dom.formStatus.textContent = 'Envoi en cours...';
        dom.formStatus.className = 'form-status';

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
        .then(response => {
            if (response.ok) {
                dom.formStatus.textContent = 'Message envoyé avec succès ! Nous vous répondrons bientôt.';
                dom.formStatus.className = 'form-status success';
                form.reset();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .catch(() => {
            dom.formStatus.textContent = 'Erreur lors de l\'envoi. Veuillez réessayer.';
            dom.formStatus.className = 'form-status error';
        });
    }

    // =========================================================================
    // Utilities
    // =========================================================================
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    }

    function debounce(fn, ms) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    function animateCounter(el, target) {
        if (!el) return;
        const current = parseInt(el.textContent) || 0;
        if (current === target) return;

        const duration = 400;
        const start = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            el.textContent = Math.round(current + (target - current) * eased);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function showToast(message) {
        // Create toast if doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: var(--bg-card);
                color: var(--text-primary);
                border: 1px solid var(--accent);
                padding: 10px 24px;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s, transform 0.3s;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2000);
    }

})();
