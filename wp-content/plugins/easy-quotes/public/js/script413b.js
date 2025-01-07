const { __ } = wp.i18n;

jQuery(document).ready(($) => {
	createIntersectionObserver();
});

const getStarColors = (index, value) => {
	const fraction = (value * 10) % 10;
	if ( index < Math.floor( value ) ) return 'rgb(229,187,79)';
	if ( index == Math.floor( value ) && fraction > 0 )
		return 'url(#partialFill-' + fraction + ')';
	if ( index >= value ) return 'rgb(255,255,255)';
}

/**
 * Fetch a Quote from REST API
 * @param {*} props 
 */
const fetchQuote = async (...props) => {
	const {
		uniqId,
		specificQuote,
		selectedCategory,
		isCustomTitle,
		isShowStars,
		isShowRating
	} = props[0];
	const element = document.getElementById(uniqId);
	const height = jQuery(element).height();
	jQuery(element).height(height);
	jQuery(element).children().hide();
	
	const response = await fetch(`/wp-json/layart/v1/quotes?id=${specificQuote.value}&cat=${selectedCategory}`);
	const data = await response.json();
	
	setData(element, data, isCustomTitle, isShowStars, isShowRating);
};

const setData = (element, data, isCustomTitle, isShowStars, isShowRating) => {

	if (!(data[0])) return;
	data = data[0];

	// TITLE
	if (!isCustomTitle) {
		jQuery(element).children().eq(0).html(data.title);
	}

	let divs = jQuery(element).children('div');
	let index = 0;

	// RATING
	if (isShowStars || isShowRating) {
		// CHANGE STARS
		const svg = divs.eq(index).children('svg');
		if (svg.length > 0) {
			jQuery(svg).children().each((index, element) => {				
				jQuery(element).attr('fill', getStarColors(index, data.rating));
			});
		}
		// CHANGE RATING
		const span = divs.eq(index).children('span');
		if (span.length > 0) {
			const rating = new Intl.NumberFormat(locale.lang).format(data.rating);
			span.html(rating + ' ' + __('out of 5', 'easy-quotes'));
		}
		index++;
	}

	// CONTENT QUOTE
	jQuery(divs).eq(index).html(data.content);
	index++;

	// CITATION
	const citation = divs.eq(index);
	let newCitation = data.author + ' – ' + data.date;
	newCitation = newCitation.replace(/^\s–\s|\s–\s$/, '');
	citation.html(newCitation);

	jQuery(element).height('');
	jQuery(element).children().fadeIn();
};


/**
 * Creates style for Font in document.head
 * @param {*} fontURL
 * @param {*} fontClassName
 * @param {*} isCustomizer
 * @param {*} widgetId
 * @returns
 */
function createStyleForFont(
	fontURL,
	fontClassName,
	isCustomizer = false,
	widgetId = null
) {
	if ( widgetId === null || isCustomizer === false ) {
		let styleId = 'easy-quotes-' + fontClassName;

		let style = document.getElementById( styleId );
		if ( style ) {
			return;
		}

		style = document.createElement( 'style' );
		style.id = styleId;
		let selector = '.' + fontClassName;
		style.innerHTML = `
			@font-face {
				font-family: ${ fontClassName };
				src: url("${ fontURL }");
			}
			${ selector } {
				font-family: ${ fontClassName };
			}
		`;
		document.head.appendChild( style );
	} else {
		// Make a difference for Widgets because of customizer

		let append = false;
		let styleId = 'easy-quotes-' + widgetId;
		let style = document.getElementById( styleId );
		if ( ! style ) {
			style = document.createElement( 'style' );
			style.id = styleId;
			append = true;
		}
		let selector = '.' + fontClassName;
		style.innerHTML = `
			@font-face {
				font-family: ${ fontClassName };
				src: url("${ fontURL }");
			}
			${ selector } {
				font-family: ${ fontClassName };
			}
		`;
		if ( append ) document.head.appendChild( style );
	}
}

/**
 * Callback for observer to start animation when div is visible in viewport
 *
 * @param {*} entries
 * @param {*} observer
 */
let callback = ( entries, observer ) => {
	entries.forEach( ( entry ) => {
		if ( entry[ 'isIntersecting' ] ) {
			const animationName = entry[ 'target' ].dataset.animation;
			entry[ 'target' ].style.setProperty(
				'animation-name',
				animationName
			);
		} else {
			entry[ 'target' ].style.setProperty( 'animation-name', 'none' );
		}
	} );
};

/**
 * Create Intersection Observer and
 * find all animated divs in .easy-quotes-quote
 */
function createIntersectionObserver() {
	const observer = new IntersectionObserver( callback, {
		threshold: 0,
	} );
	const quotes = document.querySelectorAll( '.easy-quotes-quote' );
	quotes.forEach( ( target ) => {
		// Skip outer divs in some themes
		while ( target.children.length === 1 ) target = target.children[ 0 ];

		// get animated quote divs to observe
		for ( let child of target.children ) {
			const animation =
				getComputedStyle( child ).getPropertyValue( 'animation-name' );
			if ( animation !== 'none' ) {
				child.setAttribute( 'data-animation', animation );
				observer.observe( child );
			}
		}
	} );
}

/**
 * Start the rotation for given element with given id
 * @param {*} id
 */
function startRotation(id) {
	const element = document.getElementById( id );
	const rotationSpeed = element.dataset.rotationSpeed * 1000;
	const viewingOrder = (element.dataset.isRandomViewingOrder == '0') ? 'normal' : 'random';
	let quotes = element.childNodes;
	showNext(element, quotes, viewingOrder);

	setInterval( () => {
		showNext(element, quotes, viewingOrder);
	}, rotationSpeed );
}

/**
 * Shows the next Quote in rotation Mode 'normal' and 'random'
 * @param {*} element 
 * @param {*} quotes 
 * @param {*} viewingOrder 
 */
function showNext(element, quotes, viewingOrder) {
	let visible = element.querySelectorAll('.easy-quotes-quote.la-show')[0];
	if (visible != undefined) {
		visible.classList.remove('la-show');
		visible.classList.add('la-hide');
		visible.setAttribute('data-shown', 1);
	}

	let bag = element.querySelectorAll('.easy-quotes-quote:not([data-shown])');
	if (bag.length === 0) {
		quotes.forEach(element => {
			element.removeAttribute('data-shown');
		});
		bag = element.querySelectorAll('.easy-quotes-quote:not([data-shown])');
	}

	let index = 0;
	if (viewingOrder === 'random') {
		index = Math.floor(Math.random() * bag.length);
		if (bag[index] === visible) {
			index = (index + 1) % bag.length;
		}
	}
	bag[index].classList.remove('la-hide');
	bag[index].classList.add('la-show');
}