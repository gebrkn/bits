(function () {
    var CSS = `
        #reso {
            background: #ddd;
        }
        
        #reso * {
            font-family: Monaco, Consolas, monospace;
            font-size: 12px;
            box-sizing: border-box;
        }
        
        #reso_1 {
            display: flex;
            align-items: center;
            background-color: #2196F3;
            color: white;
            padding: 8px;
        }
        
        #reso_2 {
            display: flex;
            padding: 4px;
        }
        
        #reso_3 {
            display: flex;
            align-items: center;
            padding: 3px;
            background: #37474F;
            font-size: 10px;
            color: #ccc;
            overflow: hidden;
        }

        #reso_02 {
            flex: 1;
            overflow: auto;
            background: #eee;
            border: 1px solid #B0BEC5;
        }

        #reso_12 {
            flex: 1;
            overflow: auto;
            margin: 0 8px;
            background: #B0BEC5;
        }

        #reso_22 {
            flex: 1;
            overflow: auto;
        }
    
        #reso_re {
            width: 50%;
            border: 0;
            font-size: 14px;
            padding: 3px;
            margin: 0 3px;
            color: #444;
            background: #eee;
            border: 1px solid #B0BEC5;
        }
        
        #reso_matches {
            flex: 1;
            text-align: right;
            padding-right: 8px;
        }
        
        #reso_matches span {
            font-size: 12px;
            color: #2196F3;
            background: #E3F2FD;
            padding: 0 6px;
            border-radius: 6px;
        }
        
        #reso_text {
            border: 0;
            padding: 8px;
            width: 100%;
            background: transparent;
            resize: none;
        }

        #reso_hilite {
            padding: 8px;
            line-height: 140%;
            color: #555;
        }

        #reso_hilite b {
            font-weight: normal;
            color: white;
        }

        #reso_error {
            color: #D32F2F;
        }
    
        #reso_info table {
            border-collapse: collapse;
        }
    
        #reso_info td {
            font-size: 12px;
            padding: 6px;
        }
    
        #reso_info th {
            text-align: left;
            font-size: 12px;
        }
    
        .reso_num {
            text-align: right;
            padding-right: 6px;
            font-weight: bold;
            color: #ccc;
        }
    
        .reso_row_x {
            color: white;
        }
    
        .reso_row_x b {
            padding: 0 5px;
            font-weight: normal;
        }
    
        .reso_row_0 {
            background: #eee;
        }
    
        .reso_row_1 {
            background: #fff;
        }
        
        #reso_url {
            width: 50%;
            background: transparent;
            border: none;
            color: #aaa;
        }
        
        #reso_help {
            flex: 1;
            text-align: right;
        }
        
        #reso_help a {
            padding: 0 8px;
            text-decoration: none;
            color: white;
        }
    `;

    var HTML = `
        <div id=reso_1>
            / <input id=reso_re> /
            <label><input type=checkbox id=reso_flag_g>g </label>
            <label><input type=checkbox id=reso_flag_i>i </label>
            <label><input type=checkbox id=reso_flag_m>m </label>
            <label><input type=checkbox id=reso_flag_u>u </label>
            <div id=reso_matches></div>
        </div>
        <div id=reso_2>
            <div id=reso_02>
                <textarea id=reso_text></textarea>
            </div>
            <div id=reso_12>
                <div id=reso_hilite></div>
            </div>
            <div id=reso_22>
                <div id=reso_info></div>
            </div>
        </div>
        <div id=reso_3>
            <input id=reso_url>
            <div id=reso_help>
                <a id=reso_help href="https://merribithouse.net/reso.html">?</a>
            </div>
        </div>
    `;

    var COLORS = [
        '#B71C1C',
        '#673AB7',
        '#00897B',
        '#827717',
        '#F57F17',
        '#BF360C',
    ];

    var URL = '';

    function $$(id) {
        return document.getElementById(id);
    }

    function format(f) {
        var a = [].slice.call(arguments, 1);
        return f.replace(/{(\d+)}/g, function (_, n) {
            return a[n];
        });
    }

    function htmlize(s) {
        s = s.replace(/&/g, '&amp;');
        s = s.replace(/</g, '&lt;');
        s = s.replace(/>/g, '&gt;');
        s = s.replace(/\n/g, '<br>\n');
        return s;
    }

    function update() {

        $$('reso_info').innerHTML = '';
        $$('reso_hilite').innerHTML = '';
        $$('reso_url').value = '';

        $$('reso_text').style.height = ($$('reso_text').scrollHeight + 10) + 'px';

        var rbody = $$('reso_re').value,
            text = $$('reso_text').value;

        var rflags = 'gimu'.split('').filter(function (f) {
            return $$('reso_flag_' + f).checked;
        }).join('');

        var re;

        try {
            re = new RegExp(rbody, rflags)
        } catch (e) {
            $$('reso_hilite').innerHTML = format('<span id=reso_error>{0}</span>', htmlize(String(e)));
            return;
        }

        var matches = [];

        var hilite = text.replace(re, function () {
            matches.push([].slice.call(arguments, 0));
            return '\x01' + arguments[0] + '\x02';
        });

        hilite = htmlize(hilite);
        hilite = hilite.replace(/\x02/g, '</b>')

        var n = 0;

        hilite = hilite.replace(/\x01/g, function () {
            return format('<b style="background:{0}">', COLORS[n++ % COLORS.length]);
        });

        $$('reso_hilite').innerHTML = hilite;

        var tab = '';

        matches.forEach(function (m, n) {
            tab += format(
                '<tr class=reso_row_x><th colspan=2><b style="background:{0}">match {1}</b></th></tr>',
                COLORS[n % COLORS.length], n + 1);

            for (var i = 0; i < m.length - 2; i++) {
                tab += format(
                    '<tr class=reso_row_{0}><td class=reso_num>{1}</td><td width=100%>{2}</td></tr>',
                    i % 2, i, htmlize(m[i]));
            }
        });

        $$('reso_matches').innerHTML = format('<span>{0}</span>', matches.length);
        $$('reso_info').innerHTML = format('<table>{0}</table>', tab);

        $$('reso_url').value = format('{0}?{1}&amp;.js',
            URL,
            window.btoa(JSON.stringify([String(re), text]))
        );
    }

    function create(re, text) {
        var m = String(re).match(/^\/(.+?)\/([a-z]*)$/),
            rbody = m ? m[1] : '',
            rflags = m ? m[2] : '';

        var div = document.createElement('div');
        div.id = 'reso';
        div.innerHTML = format('<style>{0}</style>{1}', CSS, HTML);
        document.body.appendChild(div);

        $$('reso_re').value = rbody;
        $$('reso_text').value = text;

        $$('reso_re').addEventListener('input', update);
        $$('reso_text').addEventListener('input', update);

        'gimu'.split('').forEach(function (f) {
            $$('reso_flag_' + f).checked = rflags.indexOf(f) >= 0;
            $$('reso_flag_' + f).addEventListener('change', update);
        });

        $$('reso_url').addEventListener('focus', function () {
            this.select()
        });
    }

    window.onload = function () {
        var re = '', text = '';

        [].forEach.call(document.getElementsByTagName('script'), function (s) {

            var m = String(s.src).match(/^(.+?reso\.js)\?([^&]+)/);

            if (m) {
                URL = m[1];

                try {
                    var r = JSON.parse(window.atob(m[2]));
                    re = r[0];
                    text = r[1];
                } catch (e) {
                }
            }
        });

        create(re, text);
        update()
    }


})();
