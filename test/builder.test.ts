import * as xml2js from '../src/xml2js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import diff from 'diff';

// fileName = path.join __dirname, '/fixtures/sample.xml'

// shortcut, because it is quite verbose
const equ = assert.equal;

// equality test with diff output
const diffeq = function (expected: string, actual: string) {
  const diffless = "Index: test\n===================================================================\n--- test\texpected\n+++ test\tactual\n";
  const patch = diff.createPatch('test', expected.trim(), actual.trim(), 'expected', 'actual');
  if (patch !== diffless) { throw patch; }
};

describe("builder", function () {
  test('building basic XML structure', function (done) {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xml><Label/><MsgId>5850440872586764820</MsgId></xml>'
    const obj = { "xml": { "Label": [""], "MsgId": ["5850440872586764820"] } }
    const builder = new xml2js.Builder({ renderOpts: { pretty: false } })
    const actual = builder.buildObject(obj);
    diffeq(expected, actual)
    done()
  });

  test("setting XML declaration", function (done) {
    const expected = '<?xml version="1.2" encoding="WTF-8" standalone="no"?><root/>'
    const opts = {
      renderOpts: {
        pretty: false
      },
      xmldec: {
        'version': '1.2', 'encoding': 'WTF-8', 'standalone': false
      }
    };
    const builder = new xml2js.Builder(opts);
    const actual = builder.buildObject({});
    diffeq(expected, actual);
    done();
  });

  test("pretty by default", function (done) {
    const expected = `\
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <xml>
      <MsgId>5850440872586764820</MsgId>
    </xml>
    \
    `;
    const builder = new xml2js.Builder();
    const obj = { "xml": { "MsgId": ["5850440872586764820"] } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done
  });


  test("setting indentation", function (done) {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
    <MsgId>5850440872586764820</MsgId>
</xml>
\
`;
    const opts = { renderOpts: { pretty: true, indent: '    ' } };
    const builder = new xml2js.Builder(opts);
    const obj = { "xml": { "MsgId": ["5850440872586764820"] } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done()
  });

  test("headless option", function (done) {
    const expected = `\
<xml>
    <MsgId>5850440872586764820</MsgId>
</xml>
\
`;
    const opts = {
      renderOpts: {
        pretty: true, indent: '    '
      },
      headless: true
    };
    const builder = new xml2js.Builder(opts);
    const obj = { "xml": { "MsgId": ["5850440872586764820"] } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  });

  test("allowSurrogateChars option", function (done) {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
    <MsgId>\uD83D\uDC33</MsgId>
</xml>
\
`;
    const opts = {
      renderOpts: {
        pretty: true, indent: '    '
      },
      allowSurrogateChars: true
    };
    const builder = new xml2js.Builder(opts);
    const obj = { "xml": { "MsgId": ["\uD83D\uDC33"] } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  });

  test("explicit rootName is always used: 1. when there is only one element", function (done) {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><FOO><MsgId>5850440872586764820</MsgId></FOO>';
    const opts = { renderOpts: { pretty: false }, rootName: 'FOO' };
    const builder = new xml2js.Builder(opts);
    const obj = { "MsgId": ["5850440872586764820"] };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test("explicit rootName is always used: 2. when there are multiple elements", function (done) {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><FOO><MsgId>5850440872586764820</MsgId></FOO>';
    const opts = { renderOpts: { pretty: false }, rootName: 'FOO' };
    const builder = new xml2js.Builder(opts);
    const obj = { "MsgId": ["5850440872586764820"] };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test(" default rootName is used when there is more than one element in the hash", function (done) {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root><MsgId>5850440872586764820</MsgId><foo>bar</foo></root>';
    const opts = { renderOpts: { pretty: false } };
    const builder = new xml2js.Builder(opts);
    const obj = { "MsgId": ["5850440872586764820"], "foo": "bar" };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test("when there is only one first-level element in the hash, that is used as root", function (done) {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><first><MsgId>5850440872586764820</MsgId><foo>bar</foo></first>';
    const opts = { renderOpts: { pretty: false } };
    const builder = new xml2js.Builder(opts);
    const obj = { "first": { "MsgId": ["5850440872586764820"], "foo": "bar" } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test("parser -> builder roundtrip", function (done) {
    const fileName = path.join(__dirname, '/fixtures/build_sample.xml');
    return fs.readFile(fileName, function (err: any, xmlData: { toString: () => any; }) {
      const xmlExpected = xmlData.toString();
      return xml2js.parseString(xmlData, { 'trim': true }, function (err: any, obj: any) {
        equ(err, null);
        const builder = new xml2js.Builder({});
        const xmlActual = builder.buildObject(obj);
        diffeq(xmlExpected, xmlActual);
        done();
      });
    });
  });

  test("building obj with undefined value", function (done) {
    const obj = { node: 'string', anothernode: undefined };
    const builder = new xml2js.Builder({ renderOpts: { pretty: false } });
    const actual = builder.buildObject(obj);
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root><node>string</node><anothernode/></root>';
    equ(actual, expected);
    done();
  })

  test("building obj with null value", function (done) {
    const obj = { node: 'string', anothernode: null };
    const builder = new xml2js.Builder({ renderOpts: { pretty: false } });
    const actual = builder.buildObject(obj);
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root><node>string</node><anothernode/></root>';
    equ(actual, expected);
    done();
  })

  test("escapes escaped characters", function (done) {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
  <MsgId>&amp;amp;&amp;lt;&amp;gt;</MsgId>
</xml>
\
`;
    const builder = new xml2js.Builder;
    const obj = { "xml": { "MsgId": ["&amp;&lt;&gt;"] } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test(" cdata text nodes", function (done) {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
  <MsgId><![CDATA[& <<]]></MsgId>
</xml>
\
`;
    const opts = { cdata: true };
    const builder = new xml2js.Builder(opts);
    const obj = { "xml": { "MsgId": ["& <<"] } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test(" cdata text nodes with escaped end sequence", function (done) {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
  <MsgId><![CDATA[& <<]]]]><![CDATA[>]]></MsgId>
</xml>
\
`;
    const opts = { cdata: true };
    const builder = new xml2js.Builder(opts);
    const obj = { "xml": { "MsgId": ["& <<]]>"] } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test("uses cdata only for chars &, <, >", function (done) {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
  <MsgId><![CDATA[& <<]]></MsgId>
  <Message>Hello</Message>
</xml>
\
`;
    const opts = { cdata: true };
    const builder = new xml2js.Builder(opts);
    const obj = { "xml": { "MsgId": ["& <<"], "Message": ["Hello"] } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test(" uses cdata for string values of objects", function (done) {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
  <MsgId><![CDATA[& <<]]></MsgId>
</xml>
\
`;
    const opts = { cdata: true };
    const builder = new xml2js.Builder(opts);
    const obj = { "xml": { "MsgId": "& <<" } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test(" does not error on non string values when checking for cdata", function (done) {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
  <MsgId>10</MsgId>
</xml>
\
`;
    const opts = { cdata: true };
    const builder = new xml2js.Builder(opts);
    const obj = { "xml": { "MsgId": 10 } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test(" does not error on array values when checking for cdata", function (done) {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
  <MsgId>10</MsgId>
  <MsgId>12</MsgId>
</xml>
\
`;
    const opts = { cdata: true };
    const builder = new xml2js.Builder(opts);
    const obj = { "xml": { "MsgId": [10, 12] } };
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  })

  test("building obj with array", function (done) {
    const expected = `\
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <root>
      <MsgId>10</MsgId>
      <MsgId2>12</MsgId2>
    </root>
    \
    `;
    const opts = { cdata: true };
    const builder = new xml2js.Builder(opts);
    const obj = [{ "MsgId": 10 }, { "MsgId2": 12 }];
    const actual = builder.buildObject(obj);
    diffeq(expected, actual);
    done();
  });
}); 