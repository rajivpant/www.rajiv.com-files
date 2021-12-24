var cxCandyObj = {
    version: '2016-03-16 01',
    renderTemplateHost : 'http://cdn.cxpublic.com/',
    initialized : false,
    userId : null,
    meta : { hasAd : 'u' },
    sites : {
        'online.wsj.com':'9222318613852486900',
        'www.wsj.com':'9222318613852486900',
        'www.wsjplus.com' : '1144060886250044680',
        'live.wsj.com':'9222325317970618875',
        'www.marketwatch.com':'9222325317970825873',
        'marketwatch.com':'9222325317970825873',
        'www.barrons.com':'9222325317970825875',
        'trkcxuevt.wsj.com':'9222334397379502889',
        'cn.wsj.com':'9222335528567651934',
        'www.wsj.com.tr':'9222335528567651935',
        'wsj.com.tr':'9222335528567651935',
        'br.wsj.com':'9222335528567651936',
        'jp.wsj.com':'9222335528673021906',
        'kr.wsj.com':'9222335528673021931',
        'indo.wsj.com':'9222335528673021932',
        'store.wsj.com':'9222368254458574875',
        'onboarding.cxpublic.com':'9222363238898586877'
    },
    initialize : function() {
        cX.addEventListener(window, 'message', cxdj.renderCallback);
        cxdj.meta = cxdj.readPageContext();
    },
    isSubscriber : function(sub) {
        return (sub === 'prosubscriber') || (sub === 'procbsubscriber') || (sub === 'subscriber');
    },
    reportEvent: function (explicitUrl, extraData) {
        var locData = null;
        var siteId = '9222318613852486900';

        if (explicitUrl && explicitUrl.length && (explicitUrl.indexOf('https://store.wsj.com') === 0)) {
            cX.initializePage();
            siteId = cxdj.sites['store.wsj.com'];
        } else {
            var hostname = window.location.hostname;
            if (hostname) {
                if (cxdj.sites[hostname]) {
                    siteId = cxdj.sites[hostname];
                }
            }
        }

        cX.setSiteId(siteId);
        cX.setCustomParameters(cxdj.meta);
        if (extraData) {
            cX.setCustomParameters(extraData);
        }

        if (cxdj.isSubscriber(cxdj.meta.subscriber) && (cxdj.meta.hasUid == 'y')) {
            cX.setUserProfileParameters({ knownSubscriber : 1})
        }

        if (explicitUrl && explicitUrl.length) {
            locData = { 'location': explicitUrl };
        }

        if (cxdj.userId) {
            cX.addExternalId({'id':cxdj.userId, 'type':'wsj'});
        }

        cX.sendPageViewEvent(locData);
    },
    reportFunnelEvent : function(extraData) {

        cX.callQueue.push(['invoke', function() {
            var event = 'default';

            if (!extraData) {
                extraData = {};
            }

            var uArgs = cX.library.parseUrlArgs();
            extraData.hasAdId = uArgs.cx_adcampaign ? 'y' : 'n';

            if (extraData.eventType) {
                event = extraData.eventType;

                if (event === 'orderSuccessful') {
                    extraData.cxad_trail = 'conversion';
                    extraData.cxad_ad_folder = uArgs.cx_adcampaign ? uArgs.cx_adcampaign : '000000015f7f038c';
                }
            }
            cxdj.reportEvent('https://store.wsj.com/' + event, extraData);
        }]);
    },
    annotateUserProfile : function(userAction) {
        if (!userAction) {
            userAction = 'default';
        }
        var loc = 'http://event.wsj.com' + '?et=' + userAction;
        cX.setUserProfileParameters({
            userAction : userAction
        });
        cX.setSiteId('9222334397379502889');
        cX.sendPageViewEvent({ 'location': loc });
    },
    getDisplayDiv: function(divMatch) {
        if (cxdj.meta.hasAd === 'n') {
            var div = $(divMatch);
            if ((div.length === 1) && (div.children().length === 0)) {
               return div;
            }
        }
        return null;
    },
    showCandyBar: function() {
        var div = cxdj.getDisplayDiv('#cx-candybar');
        var renderTemplate = cxdj.isSubscriber(cxdj.meta.subscriber) ?  'wsj-candybar-subscriber.html' : 'wsj-candybar-article.html';
        if (div) {
            div.css({position: 'fixed', bottom:0, width:'100%', 'z-index' : 8000, display: 'none'});
            cX.callQueue.push(['insertWidget', {
                appendToElementId: 'cx-candybar',
                width: '100%', height: 0,
                renderTemplateUrl : cxdj.renderTemplateHost + renderTemplate,
                meta: cX.JSON.stringify(cxdj.meta)
            }]);
        }
    },
    showPopTart: function() {
        var div = cxdj.getDisplayDiv('#cx-poptart');
        if (div) {
            div.css({position:'fixed', right:'30px', bottom:'30px', 'z-index' : 8000});
            cX.callQueue.push(['insertWidget', {
                appendToElementId: 'cx-poptart',
                width: 400, height: 110,
                renderTemplateUrl: cxdj.renderTemplateHost + 'wsj-poptart.html',
                meta: cX.JSON.stringify(cxdj.meta)
            }]);
            cxdj.poptartPresentation('#cx-poptart', 0.5);
        }
    },
    showScrim: function () {
        var div = cxdj.getDisplayDiv('#cx-scrim');
        if (div) {
            var renderTemplate = cX.getTopLevelDomain() == 'wsjplus.com'  ? 'wsjplus-scrim.html' :'wsj-scrim.html';

            div.css({position:'fixed', top:'0', left:'0', width: '100%', height: '100%', display: 'none', 'z-index' : 8000});
            cX.callQueue.push(['insertWidget', {
                appendToElementId: 'cx-scrim',
                width: '100%', height: 0,
                renderTemplateUrl:cxdj.renderTemplateHost + renderTemplate,
                meta: cX.JSON.stringify(cxdj.meta)
            }]);
        }
    },
    showCandyBarHP: function() {
        var div = cxdj.getDisplayDiv('#cx-candybarhp');
        if (div) {
            var renderTemplate = cxdj.isSubscriber(cxdj.meta.subscriber) ?  'wsj-candybar-subscriber.html' : 'wsj-candybar-hp.html';

            div.css({position: 'fixed', bottom:0, width:'100%', 'z-index' : 8000, display: 'none'});
            cX.callQueue.push(['insertWidget', {
                appendToElementId: 'cx-candybarhp',
                width: '100%', height: 0,
                renderTemplateUrl : cxdj.renderTemplateHost + renderTemplate,
                meta: cX.JSON.stringify(cxdj.meta)
            }]);
        }
    },
    showSnippet: function () {
        var div = cxdj.getDisplayDiv('#cx-snippetad');
        if (div) {
            div.html('<div id="cx-snippet-inner"></div>');
            cX.callQueue.push(['insertWidget', {
                appendToElementId: 'cx-snippet-inner',
                width: 700, height: 530,
                renderTemplateUrl: cxdj.renderTemplateHost + 'wsj-snippet.html',
                meta: cX.JSON.stringify(cxdj.meta)
            }]);
        }
    },
    showInterstitial: function () {
        var div = cxdj.getDisplayDiv('#cx-interstitial-snippet');
        if (div) {
            div.html('<div id="cx-interstitial-inner"></div>');
            cX.callQueue.push(['insertWidget', {
                appendToElementId: 'cx-interstitial-inner',
                width: 540, height: 538,
                renderTemplateUrl: cxdj.renderTemplateHost + 'barrons-interstitial-snippet.html',
                meta: cX.JSON.stringify(cxdj.meta)
            }]);
        }
    },
    showEditorsPicks : function() {
        var div = cxdj.getDisplayDiv('#cx-editor-picks');
        if (div) {
            div.css({'z-index': 8000});

            cX.insertWidget({
                widgetId: '8458d6491f24990bf92c0479f322eddfc128eb6c',
                appendToElementId: 'cx-editor-picks',
                width: '100%', height: 366, renderTemplateUrl: 'auto',
                meta: cX.JSON.stringify(cxdj.meta)
            });

            $("[data-module-zone='top_stories']").css({'display': 'none'});
            $(".top-stories-strap").css({'display': 'none'});
        }
    },
    registerScrollExpansion: function(divId, startExpanded, stopExpanded) {
        var expanded = false;

        $(window).bind("scroll dynamicScroll", function(){
            var totalHeight = $(document).height() - $(window).height();
            var current = $(window).scrollTop();

            var start = totalHeight * startExpanded;
            var stop = totalHeight * stopExpanded;

            if( current >= start && current <= stop && !expanded){
                expanded = true;
                $(divId + ' iframe').height(150);
            }
            else if( (current < start || current > stop) && expanded){
                expanded = false;
                $(divId + ' iframe').height(149);
            }
        }).trigger("dynamicScroll");
    },
    poptartPresentation: function(divId, showThreshold) {
        var showing = true;
        $(divId).css({display : 'none'});

        $(window).bind("scroll dynamicScroll", function(){
            var totalHeight = $(document).height() - $(window).height();
            var current = $(window).scrollTop();

            var showPosition = totalHeight * showThreshold;

            if( current >= showPosition  && !showing){
                $(divId + ' iframe').stop(true);
                $(divId + ' iframe').fadeIn();
                $(divId).fadeIn();
                showing = true;
            }
            else if( current < showPosition && showing){
                $(divId + ' iframe').stop(true);
                $(divId + ' iframe').fadeOut();
                showing = false;
            }
        }).trigger("dynamicScroll");
    },
    renderCallback: function(event) {
        if (event && event.data && typeof event.data === 'string' && cX && cX.decodeUrlEncodedNameValuePairs) {
            var eventData = cX.decodeUrlEncodedNameValuePairs(event.data);

            var candyId = '#cx-candybar';

            if (eventData.type === 'hp') {
                candyId = '#cx-candybarhp';
            } else if (eventData.type === 'scrim') {
                candyId = '#cx-scrim';
            }

            switch (eventData.method) {
                case 'cxShowAllOffers':
                    //cxdj.requestAllOffers();
                    break;
                case 'cxUserAction':
                    cxdj.annotateUserProfile(eventData.type);
                    break;
                case 'cxCandyResize':
                    if ((eventData.contentHeight === '100%')  || $.isNumeric(eventData.contentHeight)) {
                        $(candyId + ' iframe').height(eventData.contentHeight);
                    }
                    if ((eventData.contentWidth === '100%') || $.isNumeric(eventData.contentWidth)) {
                        $(candyId + ' iframe').width(eventData.contentWidth);
                    }
                    break;
                case 'cxCandyShow':
                    $(candyId).css({display : 'block'});
                    break;
                case 'cxCandyHide':
                    $(candyId).css({display : 'none'});
                    $(candyId + 'iframe').height(0);
                    break;
            }
        }
    },
    calculateHash : function(uid) {
        var hash = 0, i, chr, len;
        if (! (uid && uid.length && (typeof uid === 'string'))) {
            return hash;
        }
        for (i = 0, len = uid.length; i < len; i++) {
            chr   = uid.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return Math.abs(hash);
    },
    readPageContext: function() {
        var params = {};

        params.hasAd = 'n';

        if (($('#RollOutAd970x66').length > 0) || ($("#AD_PUSH").children().length > 0)) {
            params.hasAd = 'y';
        }

        try {
            var uArgs = cX.library.parseUrlArgs();
            if (uArgs.mod) {
                params.navSource = uArgs.mod;
            }

            if (uArgs.trackCode) {
                params.trackCode = uArgs.trackCode;
            }

            var ref = (document.referrer || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0].replace(/\./g, '');
            if (ref.length) {
                params.referrer = ref;
            }

            try {
                var isRetina = (window.devicePixelRatio && window.devicePixelRatio > 1) ||
                    (window.matchMedia && window.matchMedia("(-webkit-min-device-pixel-ratio: 1.5),(-moz-min-device-pixel-ratio: 1.5),(min-device-pixel-ratio: 1.5)").matches);
                params.retina = isRetina ? 'y' : 'n';
            } catch (e) {
                params.retina = 'u';
            }

            var elements = document.getElementsByTagName('meta');
            for (var i = 0; i < elements.length; i++) {

                var content = elements[i].content.replace(/ /g, '');
                switch (elements[i].name) {
                    case 'article.template':
                        params.template = content;
                        break;
                    case 'article.access':
                        params.access = content;
                        break;
                    case 'user.exp':
                        params.userExp = content;
                        break;
                    case 'user.type':
                        if ((content === 'nonsubscriber')||cxdj.isSubscriber(content)) {
                            params.subscriber = content;
                        } else if (content === 'freeRegister') {
                            params.subscriber = 'registered';
                        } else if (['memsubyes'].indexOf(content) > -1) {
                            params.subscriber = 'subscriber';
                        } else if (content == 'regyes') {
                            params.subscriber = 'registered';
                        } else {
                            params.subscriber = 'default';
                            params.extra1 = content;
                        }
                        break;
                    case 'section':
                        params.section = content;
                        break;
                    case 'article.section':
                        params.section = content;
                        break;
                    default:
                        break;
                }
            }

            var edition = cX.getCookie('wsjregion') || 'na,us';
            var rIdx = edition.indexOf('reset');
            edition = rIdx === -1 ? edition : edition.slice(0, rIdx - 1);
            params.edition = edition.replace(/,/g, '');

            var sVar = (typeof s === 'undefined') ? {} : s;

            if (!params.subscriber) {
                params.subscriber = 'default';
                if (sVar.prop27) {
                    if(sVar.prop27 === 'WSJ_sub_yes') {
                        params.subscriber = 'subscriber';
                    } else if(sVar.prop27 === 'WSJ_reg_yes') {
                        params.subscriber = 'registered';
                    } else if(sVar.prop27 === 'WSJ_free') {
                        params.subscriber = 'nonsubscriber';
                    } else if(sVar.prop27 === 'D=v26') {
                        if(sVar.eVar26) {
                            if (sVar.eVar26 === 'WSJ_sub_yes') {
                                params.subscriber = 'subscriber';
                            } else if (sVar.eVar26 === 'WSJ_mem_yes') {
                                params.subscriber = 'subscriber';
                            } else if (sVar.eVar26 === 'WSJ_free') {
                                params.subscriber = 'nonsubscriber';
                            } else {
                                params.extra2 = 'v26/' + sVar.eVar26;
                            }
                        } else {
                            params.extra2 = 'v26empty'
                        }
                    } else {
                        params.extra2 = sVar.prop27;
                    }
                } else {
                    params.extra2 = 'empty';
                }
            }

            if ((typeof sVar.eVar3 === 'string') && (s.eVar3.length > 5)) {
                try {
                    cxdj.userId = '' + CryptoJS.MD5(sVar.eVar3);
                }
                catch (e) {}
            }

            params.bucket = cxdj.calculateHash(cX.getUserId()) % 10;

            params.hasUid = cxdj.userId ? 'y' : 'n';

            var xp2 = cX.getCookie('XP02');

            if (typeof xp2 === 'string') {
                if (xp2.length) {
                    params.ctp = 'xp02' + (xp2.length > 16 ? xp2.substr(0, 16) : xp2);
                }
            }

            if ([null, '-1-v4'].indexOf(xp2) == -1) {
                if (['e008e61ee27d4e9f297e42b322560c63-v4','f088cb83dde67f9ff61a8a3a09b50427-v4'].indexOf(xp2) > -1) {
                    params.compete = 'xp02';
                } else {
                    params.compete = 'other';
                    params.extra3 = decodeURIComponent(xp2);
                }
            }

            if (window.JSON) {
                var cke = JSON.parse(decodeURIComponent(cX.library.getCookie('cke') || '{}'));

                if (typeof cke.A !== 'undefined') {
                    params.ckeA = cke.A;
                }

                if (typeof cke.B !== 'undefined') {
                    params.ckeB = (typeof cke.B === 'number') ? cke.B.toFixed(3) : cke.B;
                }

                if (typeof cke.C !== 'undefined') {
                    params.ckeC = (typeof cke.C === 'number') ? cke.C.toFixed(3) : cke.C;
                }

                if (typeof cke.D !== 'undefined') {
                    params.ckeD = cke.D;
                }

                if (typeof cke.F !== 'undefined') {
                    params.ckeF = cke.F;
                }
            }
        }
        catch (e) {}
        return params;
    },
    requestAllOffers : function() {
        var bucket = parseInt(cxdj.meta.bucket || '0');
        if (bucket < 2) {
            cxdj.showEditorsPicks();
        }
        cxdj.showCandyBarHP();
        cxdj.showScrim();
        if (cxdj.isSubscriber(cxdj.meta.subscriber)) {
            cxdj.showCandyBar();
            cxdj.showPopTart();
        } else {
            cxdj.showInterstitial();
            cxdj.showSnippet();
            if (bucket < 5) {
                cxdj.showCandyBar();
            } else {
                cxdj.showPopTart();
            }
        }
    },
    run : function() {
        cxdj.initialize();
        if (typeof cxDisplayAdOverride === 'undefined') {
                cxdj.requestAllOffers();
        }
        cxdj.reportEvent(null);
    }
};

var cxad = {

    getContent : function(ad, key, defaultValue) {
        if (ad.creative && ad.creative.content && ad.creative.content.length) {
            var contents = ad.creative.content;
            for (var k = 0; k < contents.length; k++) {
                var content = contents[k];
                if (content.key === key) {
                    return content.value[0];
                }
            }
        }
        return defaultValue || '';
    },

    getImage : function(ad, key) {
        var posts = [''];

        if (isRetina) {
            posts = [' retina', ''];
        }

        for (var ix in posts) {
            var p = posts[ix];

            if (ad.creative && ad.creative.images && ad.creative.images.length) {
                var images = ad.creative.images;
                var lowerKey = key.toLowerCase();
                for (var k = 0; k < images.length; k++) {
                    var image = images[k];

                    var actualKey = image.key.toLowerCase();

                    if (actualKey === lowerKey + p) {
                        return image.source;
                    }
                }
            }
        }
        return '';
    },

    getAd : function(data) {
        if (data && data.searchResult && data.searchResult.spaces && data.searchResult.spaces[0] && data.searchResult.spaces[0].ads) {
            var adSpace = data.searchResult.spaces[0];
            if (adSpace.ads.length >= 1) {
                return adSpace.ads[0];
            }
        }
        return null;
    },

    validateRGBAColor : function(color) {

        var colParts =  color.replace(/\(|\)| /g,'').split(',');

        if (colParts.length != 4 ) {
            return false;
        } else {
            for (var i = 0; i < colParts.length; ++i) {
                var v = parseFloat(colParts[i]);
                var max = i == 3 ? 1 : 255;
                if ((v < 0) || (v > max)) {
                    return false;
                }
            }
        }
        return true;
    }
};

var cxdj = cxdj || cxCandyObj;

var fromRendering = typeof renderingTemplate != 'undefined';

var cX = cX || {}; cX.callQueue = cX.callQueue || [];

function initializeCxense() {

    if (cxCandyObj.initialized) {
        return;
    }

    cxdj.initialized = true;

    cX.callQueue.push(['invoke', function() {
        cxdj.run();
    }]);
}

if (!fromRendering) {
    (function() { try { var scriptEl = document.createElement('script'); scriptEl.type = 'text/javascript'; scriptEl.async = 'async';
        scriptEl.src = ('https:' == document.location.protocol) ? 'https://scdn.cxense.com/cx.js' : 'http://cdn.cxense.com/cx.js';
        var targetEl = document.getElementsByTagName('script')[0]; targetEl.parentNode.insertBefore(scriptEl, targetEl); } catch (e) {};} ());

    (function() { try { var scriptEl = document.createElement('script'); scriptEl.type = 'text/javascript'; scriptEl.async = 'sync';
        scriptEl.src = ('https:' == document.location.protocol) ? 'https://a248.e.akamai.net/f/248/67675/6h/s2.wsj.net/static_html_files/md5.js' : 'http://s.wsj.net/static_html_files/md5.js';
        var targetEl = document.getElementsByTagName('script')[0]; targetEl.parentNode.insertBefore(scriptEl, targetEl); } catch (e) {};} ());

    initializeCxense();
}