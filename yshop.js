/*
    ads-widget-yahoo-api-ja
    http://www.tekiomo.com/github/ads-widget-yahoo-api-ja
    http://developer.yahoo.co.jp/webapi/shopping/
*/
var yshop = {
    conf : {
        api_id         : '',
        aff_type       : '',
        aff_id         : '',
        query          : '',
        jan            : '',
        isbn           : '',
        category_id    : '',
        brand_id       : '',
        person_id      : '',
        product_id     : '',
        price_from     : '',
        price_to       : '',
        offset         : '',
        sort           : '',
        affiliate_from : '',
        affiliate_to   : '',
        availability   : 1,
        discount       : '',
        shipping       : '',
        url            : '',
        type           : '',
        store_id       : '',
        num_hits       : '',
        gender         : '',
        generation     : '',
        period         : '',
        position       : 'eventrecommend',
        ele_id         : 'yshop',
        name_len       : 30,
        img_size       : 60,
        shuffle        : false,
        vc_sid         : '',
        vc_pid         : '',
        num_disp       : '',
        ads_type       : ''
    },
    get_items : function() {
        var d   = document;
        var s   = d.createElement('script');
        var c   = yshop.conf;
        var f_i = c.query || c.jan || c.isbn || c.category_id || c.brand_id || c.person_id || c.product_id || c.store_id;

        var chk_url = function(u) {
            return u && u.match(/https?\:\/\/[a-zA-Z0-9;\/\?\:@&=\+$,\-_\.\!~\*\'\(\)%#]+/);
        }
        var chk_n = function(n) {
            n = parseInt(n, '10');
            return !isNaN(n) ? n : '';
        }
        
        if (!d.getElementById(c.ele_id) || !c.api_id) return false;

        c.url      = chk_url(c.url) ? c.url : chk_url(location.href) ? location.href : '';
        c.ads_type = ((c.ads_type == 'itemSearch' && f_i) ? c.ads_type : c.ads_type.match(/^(queryRanking|categoryRanking|getModule|contentMatchItem|contentMatchRanking)$/)) ? RegExp.$1 : f_i ? 'itemSearch' : c.url ? 'contentMatchItem' : 'queryRanking';

        s.charset = 'UTF-8';
        s.type    = 'text/javascript';
        
        s.src     = [
            'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D\'', 
            'http%3A%2F%2Fshopping.yahooapis.jp%2FShoppingWebService%2FV1%2F', c.ads_type,
            '%3Fappid%3D', c.api_id, '%26affiliate_type%3D', c.aff_type, '%26affiliate_id%3D', c.aff_id,
            ( c.ads_type == 'itemSearch'
                ?   [
                    '%26query%3D', encodeURI(c.query),
                    '%26jan%3D', c.jan,
                    '%26isbn%3D', c.isbn,
                    '%26product_id%3D', c.product_id,
                    '%26brand_id%3D', c.brand_id,
                    '%26category_id%3D', c.category_id,
                    '%26person_id%3D', c.person_id,
                    '%26store_id%3D', c.store_id,
                    '%26price_from%3D', c.price_from,
                    '%26price_to%3D', c.price_to,
                    '%26affiliate_from%3D', c.affiliate_from,
                    '%26affiliate_to%3D', c.affiliate_to,
                    '%26offset%3D', c.offset,
                    '%26availability%3D', c.availability,
                    '%26discount%3D', c.discount,
                    '%26shipping%3D', c.shipping,
                    '%26sort%3D', (c.sort.replace(new RegExp('^\\+'), '%2B').replace(new RegExp('^\\-'), '%2D').match(/^(%2(?:B|D))(price|name|score|sold|affiliate)$/) ? encodeURI(RegExp.$1) + RegExp.$2 : ''),
                    '%26type%3D', (c.type.match(/^(all|any)$/) ? RegExp.$1 : ''),
                    '%26hits%3D', (chk_n(c.num_hits) || chk_n(c.num_disp))
                ].join('')
                : c.ads_type == 'contentMatchItem'
                ?   [
                   '%26store_id%3D', c.store_id,
                    '%26url%3D', encodeURI(c.url),
                    '%26type%3D', (c.type.match(/^(keyword|brand|person)$/) ? RegExp.$1 : ''),
                    '%26hits%3D', chk_n(c.num_hits)
                ].join('')
                : c.ads_type == 'contentMatchRanking'
                ?   [
                    '%26url%3D', encodeURI(c.url)
                ].join('')
                : c.ads_type == 'getModule'
                ?   [
                    '%26position%3D', (c.position.match(/^(eventrecommend|hotitem|querybox|itembox|special|pickup)$/) ? RegExp.$1 : 'eventrecommend')
                ].join('')
                : c.ads_type == 'categoryRanking'
                ?   [
                    '%26period%3D', (c.period.match(/^(weekly|daily)$/) ? RegExp.$1 : ''),
                    '%26gender%3D', (c.gender.match(/^(male|female)$/) ? RegExp.$1 : ''),
                    '%26offset%3D', c.offset,
                    '%26generation%3D', c.generation,
                    '%26category_id%3D', c.category_id
                ].join('')
                :   [
                    '%26type%3D', (c.type.match(/^(ranking|up)$/) ? RegExp.$1 : ''),
                    '%26hits%3D', chk_n(c.num_hits)
                ].join('')
            ), '\'&format=json&callback=yshop.load_items'].join('');
        
        d.getElementsByTagName('head')[0].appendChild(s);
    },
    load_items : function(obj) {
        var c = yshop.conf;
        var items;

        if (obj.query.results != null) {
            var r = obj.query.results.ResultSet.Result;
            if (
                (typeof r.Hit == 'object' && (r.totalResultsReturned > 0 || r.Hit.length > 0))
                || (typeof r.QueryRankingData == 'object' || typeof r.RankingData == 'object')
            ) {
                items = r.QueryRankingData || r.RankingData || r.Hit;
            }
        }
        
        if (typeof items == 'undefined') return false;
        
        items = !items.length ? [items] : c.shuffle ? items.sort(function() Math.random() > 0.5 ? 1 : -1) : items;
        
        var h = [];
        for (var i = 0, n = (function(){
            var chk_n = function(n) {
                n = parseInt(n, '10');
                return !isNaN(n) ? n : Number.MAX_VALUE;
            }

            return Math.min(chk_n(c.num_hits), chk_n(c.num_disp), items.length);
        })(); i < n; i++) {
            var item = items[i];
            var name = item.Name || item.Query || item.Title;
            
            h.push([
                '<li><a href=\"', (c.aff_type == 'vc' && c.vc_sid && c.vc_pid && item.Url.match(/^http\:\/\/store\.shopping\.yahoo\.co\.jp\/.+\/.+\.html/) ? [ 'http://ck.jp.ap.valuecommerce.com/servlet/referral?sid=', c.vc_sid, '&pid=', c.vc_pid, '&vc_url=', encodeURIComponent(item.Url) ].join('') : item.Url), '\" title=\"', (typeof item.Headline != 'object' ? item.Headline + ' ' : ''), name, '\" target="_blank">',
                (function(s, im, t){
                    if (!isNaN(s) && s > 0 && item.Image && (item.Image.Small != null || typeof item.Image.Original == 'string')) {
                        t = s > 400 ? 'l' : s > 300 ? 'k' : s > 200 ? 'j' : s > 146 ? 'i' : s > 132 ? 'g' : s > 106 ? 'e' : s > 76 ? 'd' : s > 56 ? 'c' : s > 40 ? 'b' : 'a';
                        im = [ '<img src=\"', (item.Image.Small != null ? item.Image.Small.replace(new RegExp('(http\.+image\.shopping\.yahoo\.co\.jp\/i\/)\\w(\/.+)'), '$1' + t + '$2') : item.Image.Original), '\">' ].join('')
                    }
                    return im;
                })(parseInt(c.img_size, '10'), '', 'a'),
                '<span class="name">', (name.length > c.name_len ? name.substr(0, c.name_len - 3) + '...' : name), '</span>',
                (function(pr) {
                    if (item.Price) {
                        pr = [
                            '<span class="price">',
                            (function(p){
                                while(p != (p = p.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
                                return item.Price.currency == 'JPY' ? '￥' + p : p + ' ' + item.Price.currency;
                            })(new String(item.Price.content + '').replace(/,/g, "")),
                            '</span>'
                        ].join('');
                    }
                    return pr;
                })(''),
                '</a></li>'
            ].join(''));
        };

        document.getElementById(c.ele_id).innerHTML = [
            '<ul class="',
            (c.ads_type.match(/^(itemSearch|contentMatchItem|categoryRanking|contentMatchRanking|getModule)$/) ? 'item' : 'text'),
            '">'].concat(
            h, '</ul><p class="credit"><span style="margin:4px 0 15px 0"><a href="http://developer.yahoo.co.jp/about" target="_brank">Webサービス by Yahoo! JAPAN</a></span></p>'
        ).join('');
    }
}

