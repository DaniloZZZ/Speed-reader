This fork reads text from url query parameter `text`.

This allows to integrate the reader with qutebrowser.

# Userscript installation

1. Clone this repo
2. run `grunt dist` in `grunt/`
3. Copy `js/min/app.js`, `css/app.css` to `$QUTE_DATA_DIR/userscripts/speed_read`
4. Copy `app.html`, to userscripts as speed_reader.html

The userscript for qutebrowser:

```
#!/usr/bin/python

import codecs, os
from urllib.parse import urlencode
from bs4 import BeautifulSoup

appfile = os.path.join(
    os.environ.get('QUTE_DATA_DIR',
                   os.path.expanduser('~/.local/share/qutebrowser')),
    'userscripts/speed_reader.html')

with codecs.open(filename, 'r', 'utf-8') as source:
    data = source.read()
    text = BeautifulSoup(data).get_text()

    # Qutebrowser uses Chromium, which
    # will fail for documents larger than 2MB. This is 2x 'War and Peace'
    query = urlencode(dict(text=text))

    with open(os.environ['QUTE_FIFO'], 'w') as fifo:
        fifo.write('open -w %s' % ('file://'+appfile + '?'+ query))
```

# Usage

Suppose the file above is called `speed_reader`
```
:spawn --userscript speed_reader
```



---

# Speed reader

Studies have found that by not having to move your eyes to follow the text your reading, you will greatly improve the speed of your reading. This simple application allows you to read a chunk of text simply by flashing words in the same position. Enter your text, click Start and enjoy the read.

**This application is still a work in progress.**

## Why did you make Speed reader?

Mostly because all other speed reading applications i've found lack customization and important usability features such as pause between paragraphs/sentences, but also because i wanted to play with AngularJS, and i had no other project ideas in mind.


Released under the MIT License.

** Known bugs **

- You tell me.
