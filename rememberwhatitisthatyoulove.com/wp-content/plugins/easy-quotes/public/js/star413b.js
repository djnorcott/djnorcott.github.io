const svg = `<svg style="position: absolute; height: 0; width: 0;">
    <defs>
        <polygon id="star" points="0,36.3 38.2,36.3 50,0 61.8,36.3 100,36.3 69.1,58.8 80.9,95.1 50,72.7 19.1,95.1 30.9,58.8" stroke="rgb(221,168,33)" stroke-width="8" clip-path="url(#strokeInside)"></polygon>
        <clipPath id="strokeInside"><use xlink:href="#star"></use></clipPath>
        <linearGradient id="partialFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(229,187,79); stop-opacity:1"></stop>
            <stop offset="100%" style="stop-color:rgb(255,255,255); stop-opacity:1"></stop>
        </linearGradient>
        <linearGradient id="partialFill-1" xlink:href="#partialFill" x1="26%" x2="26.1%"></linearGradient>
        <linearGradient id="partialFill-2" xlink:href="#partialFill" x1="32%" x2="32.1%"></linearGradient>
        <linearGradient id="partialFill-3" xlink:href="#partialFill" x1="38%" x2="38.1%"></linearGradient>
        <linearGradient id="partialFill-4" xlink:href="#partialFill" x1="44%" x2="44.1%"></linearGradient>
        <linearGradient id="partialFill-5" xlink:href="#partialFill" x1="50%" x2="50.1%"></linearGradient>
        <linearGradient id="partialFill-6" xlink:href="#partialFill" x1="56%" x2="56.1%"></linearGradient>
        <linearGradient id="partialFill-7" xlink:href="#partialFill" x1="62%" x2="62.1%"></linearGradient>
        <linearGradient id="partialFill-8" xlink:href="#partialFill" x1="68%" x2="68.1%"></linearGradient>
        <linearGradient id="partialFill-9" xlink:href="#partialFill" x1="74%" x2="74.1%"></linearGradient>
    </defs>
</svg>`;

const element = document.createElement( 'div' );
element.innerHTML = svg;
document.body.appendChild( element.firstChild );
