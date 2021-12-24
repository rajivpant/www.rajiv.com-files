//
// Header
//
( function ( $ ) {
	$( function() {
		var global_nav = $( '#global-nav' );
		var mobile_nav = $( '#nav-mobile' );
		var body = $( 'body' );
		var offset = ( body.hasClass( 'header-leaderboard' ) ) ? 165 : 55;

		console.log(global_nav);
		// Determine offset
		global_nav.headroom( { offset: offset } );
		if ( ! body.hasClass( 'single-event' ) ) {
			mobile_nav.headroom( { offset: 55 } );
		}

		$( '.main-menu', global_nav ).click(function(e) {
			e.preventDefault();
			$( '.sub-menu', global_nav ).css( 'visibility', 'hidden' );
			$( '.mobile-search', mobile_nav ).css( 'display', 'none' );
			$( this ).children( '.sub-menu' ).css( 'visibility', 'visible' );
		});

		// Ensure that submenu clicks actually go to the menu
		$( '.main-menu .sub-menu a, .main-menu.events-page-menu-item a, .icon-live-stream a', global_nav ).click(function(e) {
			e.stopPropagation();
		});

		$( '.sub-menu', global_nav ).mouseleave(function() {
			$( '.sub-menu', global_nav ).css( 'visibility', 'hidden' );
		});

		/**
		 * Close Search and Share Areas
		 */
		var closeSearchAndShare = function() {
			$( '.search_input' ).removeClass( 'open' );
			$( '.menu_email' ).removeClass( 'fade' );
			$( '.menu_search' ).removeClass( 'fade' );
			$( '.follow' ).removeClass( 'fade' );
			$( '.main-menu' ).show();
			$( '.social-media' ).hide();
		}

		$( '.follow', global_nav ).click(function(e) {
			e.preventDefault();

			var social_media = $( '.social-media');
			if ( ! social_media.is( ':visible' ) ) {
				social_media.fadeIn( 500 );
				$( '.follow' ).removeClass( 'fade' );
				$( '.menu_email' ).addClass( 'fade' );
				$( '.menu_search' ).addClass( 'fade' );
				$( '.main-menu' ).hide();
				$( '.sub-menu' ).css( 'visibility', 'hidden' );
				$( '.search_input' ).removeClass( 'open' );
			} else {
				closeSearchAndShare();
			}
			return false;
		});

		$( '.menu_search' ).click(function(e) {
			e.preventDefault();

			var search_input = $( '.search_input' );
			if ( ! search_input.hasClass( 'open' ) ) {
				// Opening
				search_input.addClass( 'open' );
				$( '.menu_email' ).addClass( 'fade' );
				$( '.follow' ).addClass( 'fade' );

				$( '.menu_search' ).removeClass( 'fade' );
				$( '.main-menu' ).hide();
				$( '.social-media' ).hide();
				$( '.sub-menu' ).css( 'visibility', 'hidden' );

				// Focus on the input
				$( '.search_input input[type="text"]' ).focus();
			} else {
				// Closing Search
				closeSearchAndShare();
			}
			return false;
		});

		$( 'body' ).click(function(e) {
			if ( ! $( 'search_input' ).is( e.target ) && $( '.search_input' ).has( e.target ).length === 0) {
				closeSearchAndShare();
			}
		});

		// Mobile
		$( '.mobile-hamburger-icon', mobile_nav ).click(function(e) {
			e.preventDefault();

			$( '.mobile-wrap' ).fadeToggle( 'fast' );
			$( '.mobile-menu' ).fadeToggle( 'fast' );
			$( '.mobile-search' ).fadeOut( 'slow' );
			$( '.mobile-section-sub' ).fadeOut( 'fast' );
		});

		$( '.mobile-more', mobile_nav ).click(function(e) {
			e.preventDefault();

			$( '.mobile-section-sub' ).not( this ).slideUp( 'fast' );
			$( '.mobile-section-sub', this ).slideToggle( 'fast' );

			if ( $( '.mobile-arrow' ).not( this ).hasClass( 'rotate' ) ) {
				$( '.mobile-arrow' ).not( this ).removeClass( 'rotate' );
			}
			$( '.mobile-arrow', this ).addClass( 'rotate' );
		});

		// Ensure that submenu clicks continue through to their target
		$( '.mobile-section-sub a', mobile_nav ).click(function(e) {
			e.stopPropagation();
		});

		$( '.close', mobile_nav ).click(function() {
			$( this ).parent().css( 'display', 'none' );
		});

		$( '.mobile-search-icon', mobile_nav ).click(function(e) {
			e.preventDefault();

			$( '.mobile-search-icon' ).addClass( 'fade' );
			$( '.mobile-search' ).fadeToggle(400, 'swing', function() {
				$( '.mobile-search input' ).focus();
			});
			$( '.mobile-wrap' ).fadeOut( 'slow' );
			$( '.mobile-menu' ).fadeOut( 'slow' );
		});
	});
})( jQuery );
