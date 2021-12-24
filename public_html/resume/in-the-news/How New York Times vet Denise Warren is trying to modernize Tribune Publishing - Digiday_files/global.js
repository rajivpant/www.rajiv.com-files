( function ( $ ) {

	function setFlyoutPosition( navFixed ) {
		var flyoutsTop = 60;
		if ( $( '#wpadminbar' ).length > 0 ) {
			flyoutsTop += 28;
		}
		if ( navFixed == false ) {
			if ( $( '#header-ad-wrapper').length > 0 ) {
				flyoutsTop += 110;
			}
			$( '.nav-flyouts' ).css( 'position', 'absolute' );
		} else {
			$( '.nav-flyouts' ).css( 'position', 'fixed' );
		}
		$( '.nav-flyouts' ).css( 'top', flyoutsTop + 'px' );
	};

	$( window ).ready( function() {
		if ( $(window).width() >= 768 ) {
			setFlyoutPosition( false );
		}
	});

	$(document).on( "click", ".more-articles-link a", function ( e ) {
		e.preventDefault();
		var url = $( this ).attr( 'href' );
		var nextpage = '';

		$(this).addClass('loading');
		$('.loopwrapper').addClass('loopwrapper-old');

		$('.ajax-temp').load(url + ' .loopwrapper', function() {
			nextpage = $('.ajax-temp').html();
			$('#content').append(nextpage);
			$('.ajax-temp').empty();
			$('.loopwrapper-old .more-articles-link').remove();
			digiday_get_share_counts();
		});
	});

	function digiday_get_share_counts() {

		// Finds the share count elements on the page
		post_ids = _.map( $('.ajax-dd-share-count'), function(el){
			if ( $(el).data('post-id') )
				return $(el).data('post-id');
		} );

		// Populates the share count elements
		$.get(
			'/wp-admin/admin-post.php?action=social_counts',
			{ 'post_ids' : post_ids },
			function( data ){
				$.each( data, function( index, count_data ){
					$( '.ajax-dd-share-count[data-post-id="' + count_data.post_id + '"]' ).children( '.count' ).html( count_data.social_count );
				} );
			},
			'json'
		);
	}

	$(document).ready(function() {

		digiday_get_share_counts();

		$(".entry-content, .event-description").fitVids();

		// Newsletter signup form handling

		// Allows only letters and single spaces in text fields
		$.validator.addMethod( "textfilter", function( value, element ) {
			return this.optional( element ) || /^( ?[a-zA-Z0-9]+ ?)+$/i.test( value );
		}, "Letters, numbers and single spaces only please");

		// Custom validator for checkboxes, ensure that at least one is checked
		$.validator.addMethod( "require_from_group", function(value, element, options ) {
			var numberRequired = options[0];
			var selector = options[1];
			var fields = $(selector, element.form);
			var filled_fields = fields.filter(function() {
				// Had to modify the line below to make this work for checboxes
				// return $(this).val() != "";
				return $(this).is( ':checked' );
			});
			var empty_fields = fields.not(filled_fields);
			// we will mark only first empty field as invalid
			if (filled_fields.length < numberRequired && empty_fields[0] == element) {
				return false;
			}
			return true;
		// {0} below is the 0th item in the options field
		}, "Please check at least {0}.");

		// Validate form
		$( '#signup-form' ).validate( {

			// Validation rules
			rules: {
				firstname: {
					required: true,
					maxlength: 30,
					textfilter: true
				},
				lastname: {
					required: true,
					maxlength: 30,
					textfilter: true
				},
				title: {
					required: true,
					maxlength: 30,
					textfilter: true
				},
				company: {
					required: true,
					maxlength: 30,
					textfilter: true
				},
				email: {
					required: true,
					email: true
				},
				othervalue: {
					maxlength: 30,
					textfilter: true,
					required: '#otherfield:checked'
				},
				brand: { require_from_group: [1, ".jobcategory"] },
				agency: { require_from_group: [1, ".jobcategory"] },
				publisher: { require_from_group: [1, ".jobcategory"] },
				technologyprovider: { require_from_group: [1, ".jobcategory"] },
				other: { require_from_group: [1, "jobcategory"] },
				dailynewsletter: { require_from_group: [1, ".newsletter-choice"] },
				brandnewsletter: { require_from_group: [1, ".newsletter-choice"] },
				publishingnewsletter: { require_from_group: [1, ".newsletter-choice"] },
				marketingnewsletter: { require_from_group: [1, ".newsletter-choice"] },
				programmatic: { require_from_group: [1, ".interests"] },
				nativeadvertisingcontentmarketing: { require_from_group: [1, ".interests"] },
				marketingadvertisingtechnology: { require_from_group: [1, ".interests"] },
				mobile: { require_from_group: [1, ".interests"] },
				video: { require_from_group: [1, ".interests"] },
				social: { require_from_group: [1, ".interests"] },
			},

			// Custom error field placement for checkboxes, adds one error before each checkbox group
			errorPlacement: function( error, element ) {
					if ( element.hasClass( 'jobcategory' ) ) {
						$( '#jobcategory-errors' ).append( error );
					}
					else if ( element.hasClass( 'interests' ) )
						$( '#interests-errors' ).append( error );
					else if ( element.hasClass( 'newsletter-choice' ) )
						$( '#newsletter-choice-errors' ).append( error );
					else
						 error.insertAfter( element );
			},

			// Handles submission to backend, thank your or error based on json response
			// (really only checks for valid email, which is redundant but probably ok)
			submitHandler: function() {
				var form = $( '#signup-form' );
				var formData = {};
				$.each( $( 'form' ).serializeArray(), function( i, field ) {
					formData[field.name] = field.value;
				} );
				$.post( '/wp-admin/admin-post.php?action=subscribecb', formData, function( data ) {
					if( data.valid ) {
						$( '.error' ).remove();
						$( '.notice' ).remove();
						window.location = '/subscribe-thank-you/';
					} else {
						$( '.error' ).remove();
						$( '.notice' ).remove();
						$( form ).before( '<p class="error">Something went wrong with your form submission. Please try again.</p>' );
					}
				}, "json" );
				return false;
			}
		} );

		$( '#daily-signup-form' ).validate( {

			// Validation rules
			rules: {
				email: {
					required: true,
					email: true
				}
			},
			// Custom error field placement for checkboxes, adds one error before each checkbox group
			errorPlacement: function( error, element ) {
				error.insertAfter( $( '#submit' ) );
			}

		} );

		// Agenda tabs
		var height = $('.day').eq(0).outerHeight();
		$('.day-tab').eq(0).addClass('active');
		$('.day-tab').eq(0).next().show();
		$('.agenda').css('height', height + 48);

		$('.day-tab').click( function(e){
			e.preventDefault();

			height = $(this).next().outerHeight();

			$('.day-tab').removeClass('active');
			$(this).addClass('active');

			$('.day').hide();
			$(this).next().show();

			$('.agenda').css('height', height + 48);
		});

		// Event fade-cycle blocks
		var this_height = function() { return $(this).height(); }
		$("#speakers-fade,#sponsors-fade").height( function() {
			// Ensure that the containers are tall enough to support the content
			return Math.max.apply( Math, $(this).find("> div").map( this_height ) );
		} );
		$('#sponsors-fade,#speakers-fade').cycle();

		// Search flyout
		$('.search-icon').click( function(e) {
			e.preventDefault();
			$('#search-flyout').toggle();
		});

		$( '.signup-form-link' ).fancybox({
			'transitionIn'	:	'linear',
			'transitionOut'	:	'linear',
			'speedIn'		:	200,
			'speedOut'		:	200,
			'overlayShow'	:	true,
			'showCloseButton' : true
		});

		/*
		 * Speakers & Sponsors hero blocks
		 */
		$( '.hero-link' ).click( function( event ) {
			populate_hero( $( this ).attr( 'href' ) );
			$('html, body').animate( { scrollTop: $( '#hero' ).offset().top - 88 }, 500 );
		} );

		if ( $( '#hero' ).length && window.location.hash ) {
			$( '#hero' ).show();
			populate_hero( window.location.hash );
			$('html, body').scrollTop( $( '#hero' ).offset().top - 88 );
		}

		function populate_hero( tag ) {
			if ( '#' == tag[0] )
				tag = tag.substr(1);
			tpl = _.template( $( '#hero_tpl' ).html() );

			if ( $( '.speaker' ).length )
				data = get_speaker_hero_data( tag );
			else if ( $( '.sponsor' ).length )
				data = get_sponsor_hero_data( tag );
			else
				return;

			$( '#hero' ).html( tpl( data ) ).slideDown();
		}

		function get_speaker_hero_data( tag ) {
			$speaker = $( '.speaker[data-speaker="' + tag + '"]' );
			data = {
				img     : $speaker.data( 'image' ),
				img_alt : $( 'a.img-grid img', $speaker ).attr( 'alt' ),
				type    : '',
				name    : $( '.speaker-name', $speaker ).html(),
				title   : '',
				company : '',
				bio     : $( '.speaker-bio', $speaker ).html()
			};
			if ( $( '.speaker-title', $speaker ).length )
				data.title = $( '.speaker-title', $speaker ).html();
			if ( $( '.speaker-company', $speaker ).length )
				data.company = $( '.speaker-company', $speaker ).html();
			if ( $( '.speaker-type', $speaker ).length )
				data.type = $( '.speaker-type', $speaker ).html();
			return data;
		}

		function get_sponsor_hero_data( tag ) {
			$sponsor = $( '.sponsor[data-sponsor="' + tag + '"]' );
			data = {
				img         : $( 'a.img-grid', $sponsor ).html(),
				name        : $( '.sponsor-name', $sponsor ).html(),
				description : $( '.sponsor-description', $sponsor ).html()
			};

			return data;
		}

		if ( $( '.twitter-follow-button' ).length > 0 ) {
			!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
		}

		/**
		 * Form functionality for page-lead-capture.php file
		 */
		if ( $( 'body.page-template-page-lead-capture-php' ).length ) {
			$( '#sidebar label' ).addClass( 'hover-label' );

			$( '#sidebar input[type="text"]' ).focus( function( e ) {
				$label = $( this ).parents( 'li' ).find( 'label' );

				// hide label
				$label.hide();
			} );

			$( '#sidebar input[type="text"]' ).blur( function( e ) {
				if ( ! $.trim( $( this ).val() ).length ) {
					$label = $( this ).parents( 'li' ).find( 'label' );

					// show label
					$label.show();
				}
			} );
		}
		$( '.jscroll' ).jscroll( {
    		loadingHtml: '<img src="/wp-content/themes/digiday/static/images/ajax-loader.gif" alt="Loading" />',
    		padding: 1500,
    		nextSelector: 'a.jscroll-next:last',
    		callback: single_scroll_callback,
		} );

		var last_scroll = 0;
		$( window ).scroll( function() {
			var scroll_pos = $( window ).scrollTop();
			// Only continue if more than a tenth of the window height has been scrolled.
			if ( Math.abs( scroll_pos - last_scroll ) > $( window ).height() * 0.1 ) {
				// Set our last scroll position as the current position.
				last_scroll = scroll_pos;
				// Find the article that is mostly visible.
				$( ".article-loopwrapper article" ).each( function() {
					// if 25% of element is visible
					var scroll_pos = $( window ).scrollTop();
					var window_height = $( window ).height();
					var el_top = $( this ).offset().top;
					var el_height = $( this ).height();
					var el_bottom = el_top + el_height;
					if ( ( el_bottom - el_height * 0.25 > scroll_pos ) && ( el_top < ( scroll_pos + 0.5 * window_height ) ) ) {
						if ( window.location.href !== $( this ).attr( "data-url" ) ) {
							history.replaceState( null, null, $( this ).attr( "data-url" ) );
							$( "meta[property='og:title']" ).attr( 'content', $( this ).attr( "data-title" ) );
							$( "title" ).html( $( this ).find( '.entry-title' ).html() );
							$( "meta[property='og:url']" ).attr( 'content', $( this ).attr( "data-url" ) );
							$( "meta[property='og:description']" ).attr( 'content', $( this ).attr( "data-description" ) );
							$( "meta[property='article:section']" ).attr( 'content', $( this ).attr( "data-section" ) );
							$( "meta[property='og:image']" ).remove();
							$( 'head' ).append( '<meta property="og:image" content="">' );
							$( "meta[property='og:image']" ).attr( 'content', $( this ).attr( "data-img" ) );
							_gaq.push( [ '_trackPageview', $( this ).attr( "data-url" ) ] );
						}
						return( false );
					}
				} );
			}
		} );
		if ( $( window ).width() >= 768 ) {
		    $( window ).scroll( function () {
				$( ".right-col" ).each( function() {
					var el = $( this );
					var sidebar = el.find( '.right-col-inner' );
		    		var length = el.height() - sidebar.height() + el.offset().top;
			        var scroll = $( window ).scrollTop() + 60;
			        var height = sidebar.height() + 'px';

			        if ( scroll < el.offset().top ) {

			            sidebar.css( {
			                'position': 'absolute',
			                'top': '0'
			            } );

			        } else if ( scroll > length ) {

			            sidebar.css( {
			                'position': 'absolute',
			                'bottom': '0',
			                'top': 'auto'
			            } );

			        } else {

			            sidebar.css( {
			                'position': 'fixed',
			                'top': '60px',
			                'height': height
			            } );
			        }
			    } );
				$( ".article-sharing-wrapper" ).each( function( i, el ) {
					var sb = $( this );
					var pos_offset = ( sb.hasClass( 'is-tldr' ) ) ? 0 : 175;
					var sharebox = sb.find( '.article-sharing-inner' );
		    		var length = sb.height() - sharebox.height() - pos_offset + sb.offset().top - 320;
			        var scroll = $( window ).scrollTop() + 108;
			        var height = sharebox.height() + 'px';

		        	if ( sb.hasClass( 'is-tldr' ) ) {
						if ( scroll < sb.offset().top -30 ) {
							if ( 0 === i ) {
								sharebox.css( {
									'display': 'block',
				             		'position': 'absolute',
				            	    'top': '0'
					            } );
							} else {
								sharebox.css( {
			        				'display': 'none'
			        			} );
							}
			        	} else {
			        		sharebox.css( {
			            	    'position': 'fixed',
			            	    'top': '108px',
			            	    'height': height,
			            	    'left': 'auto',
			            	    'display': 'block'
			        		} );
			        	}
		        	} else {
						if ( scroll < sb.offset().top ) {
				            sharebox.css( {
				                'position': 'absolute',
				                'top': '0'
				            } );
				        } else if ( scroll > length ) {
				            sharebox.css( {
				                'position': 'absolute',
				                'bottom': pos_offset + 330 + 'px',
				                'top': 'auto'
				            } );
			        	} else {
				            sharebox.css( {
				                'position': 'fixed',
				                'top': '108px',
				                'height': height,
				                'left': 'auto',
				                'display': 'block'
				            } );
				        }
				    }
			    } );
		    } );
		}

		$( 'body' ).on( 'click', '.comment-toggle a', function( e ) {
			e.preventDefault();
			var cwrap = $( this ).parent().siblings( '.comment-wrapper' );
			if ( cwrap.children().length == 0 ) {
				$( '.comment-wrapper' ).hide();
				$( '#disqus_thread' ).appendTo( $( this ).parent().next( '.comment-wrapper' ) );
			}
			cwrap.toggle();
		} );
		$( window ).on( 'resize', function() {
			if ( $(window).width() < 768 ) {
				$( '.tldr-toggle' ).addClass( 'tldr-mobile' );
			} else {
				$( '.tldr-toggle' ).removeClass( 'tldr-mobile' );
			}
		} );
		if ( $(window).width() < 768 ) {
			$( '.tldr-toggle' ).addClass( 'tldr-mobile' );
		}
		$( '.trc_header_left_column' ).html( 'Elsewhere on <span>Digiday</span>' );

		print_ad_code();
	});

	function single_scroll_callback() {
		digiday_get_share_counts();
		print_ad_code();
		window.DISQUSWIDGETS = undefined;
		$.getScript("http://" + disqus_shortname + ".disqus.com/count.js");
		stButtons.locateElements();
		if ( $(window).width() < 768 ) {
			$( '.tldr-toggle' ).addClass( 'tldr-mobile' );
		} else {
			$( '.tldr-toggle' ).removeClass( 'tldr-mobile' );
		}
		$( '.trc_header_left_column' ).html( 'Elsewhere on <span>Digiday</span>' );
	}

	function print_ad_code() {
		var ad = $( '.ad-wrapper div' ).attr( 'id' ),
			mobile_ad = $( '.mobile-ad-wrapper div' ).attr( 'id' ),
			tid = $( '.ad-wrapper div' ).data( 'tid' ),
			mobile_tid = $( '.mobile-ad-wrapper div' ).data( 'tid' ),
			post_url = $( '.ad-wrapper div' ).data( 'url' );
		if ( undefined != ad ) {
			var units = new Array();
			var mobile_units = new Array();
			if ( $(window).width() < 768 ) {
				units = { article_1:"537654383", article_2:"537654384", article_3:"537654430", article_4:"537654431" };
				mobile_units = { mobile_article_1:"538018240", mobile_article_2:"538018280", mobile_article_3:"538018281", mobile_article_4:"538018282" };
				$( '.mobile-ad-wrapper' ).next('.single-masthead').css('display','none');
			} else {
				units = { article_1:"537342454", article_2:"537392252", article_3:"537392254", article_4:"537392255" };
			}

			if ( 'article_1' == ad ) {
				var code =
					"OX_9621392b88.setAdUnitSlotId( '" + units[ad] + "', '" + ad + "' );" +
					"OX_9621392b88.load();";
				if ( $(window).width() < 768 ) {
					code += "OX_9621392b88.setAdUnitSlotId( '" + mobile_units[mobile_ad] + "', '" + mobile_ad + "' );" +
					"OX_9621392b88.load();";
				}
			} else {
				$.getScript( "http://ox-d.digiday.com/w/1.0/jstag" );
				var code =
					"var OX_9621392b88 = OX();" +
					"OX_9621392b88.addPage('537065954');" +
					"OX_9621392b88.setAdUnitSlotId( '" + units[ad] + "', '" + ad + "' );" +
					( '0' !== tid ? "OX_9621392b88.addContentTopic('" + tid + "');" : '' ) +
					"OX_9621392b88.addVariable( 'page', '" + post_url + "');" +
					"OX_9621392b88.load();";
				if ( $(window).width() < 768 ) {
					code +=
					"var OX_9621392b88 = OX();" +
					"OX_9621392b88.addPage('537065954');" +
					"OX_9621392b88.setAdUnitSlotId( '" + mobile_units[mobile_ad] + "', '" + mobile_ad + "' );" +
					( '0' !== mobile_tid ? "OX_9621392b88.addContentTopic('" + mobile_tid + "');" : '' ) +
					"OX_9621392b88.addVariable( 'page', '" + post_url + "');" +
					"OX_9621392b88.load();";
				}
			}
			var script = document.createElement('script');
			script.appendChild( document.createTextNode( code ) );
			document.body.appendChild( script );
		}
	}

	function update_twitter_timeline_height() {
		$("#content_channel_twitter_wrapper iframe").height( function() {
			return $('article.featured.post-grid').height() - 24;
		} );
	}

	$(window).load(update_twitter_timeline_height);

})(jQuery);
