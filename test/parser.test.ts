import * as xml2js from '../src/xml2js';
import fs from 'fs'; 
import util from 'util'; 
import assert from 'assert';
import path from 'path';
import os from 'os'; 

const fileName = path.join(__dirname, '/fixtures/sample.xml'); 

const readFilePromise = (fileName: fs.PathOrFileDescriptor) => new Promise((resolve, reject) => {
  return fs.readFile(fileName, {encoding:"utf-8"},(err, value) => {
    if (err) {
      return reject(err);
    } else {
      return resolve(value);
    }
  });
});

const skeleton = (options: { emptyTag?: (() => {}) | null; explicitCharkey?: boolean; mergeAttrs?: boolean; explicitArray?: boolean; explicitChildren?: boolean; preserveChildrenOrder?: boolean; charsAsChildren?: boolean; includeWhiteChars?: boolean; trim?: boolean; normalize?: boolean; __xmlString?: any; explicitRoot?: boolean; normalizeTags?: boolean; attrkey?: string; charkey?: string; ignoreAttrs?: boolean; validator?: (xpath: any, currentValue: any, newValue: any) => any; xmlns?: boolean; attrNameProcessors?: ((name: any) => any)[]; attrValueProcessors?: ((name: any) => any)[] | ((value: any, name: any) => any)[]; valueProcessors?: ((name: any) => any)[] | ((value: any, name: any) => any)[]; tagNameProcessors?: ((name: any) => any)[]; } | null | undefined, checks: { (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (r: any): void; (arg0: any): void; }) => (function (test: { finish: () => void; }) {
  const xmlString = options != null ? options.__xmlString : undefined;
  if (options != null) {
    delete options.__xmlString;
  }
  const x2js = new xml2js.Parser(options);
  x2js.addListener('end', function (r) {
    checks(r);
    return test.finish();
  });
  if (!xmlString) {
    return fs.readFile(fileName,{encoding:"utf-8"}, function (err, data) {
      data = data.split(os.EOL).join('\n');
      return x2js.parseString(data);
    });
  } else {
    return x2js.parseString(xmlString);
  }
});

const nameToUpperCase = (name: string) => name.toUpperCase();

const nameCutoff = (name: string) => name.substring(0, 4);

const replaceValueByName = (value: any, name: any) => name;

/*
The `validator` function validates the value at the XPath. It also transforms the value
if necessary to conform to the schema or other validation information being used. If there
is an existing value at this path it is supplied in `currentValue` (e.g. this is the second or
later item in an array).
If the validation fails it should throw a `ValidationError`.
*/
const validator = function (xpath: string, currentValue: any, newValue: any) {
  if (xpath === '/sample/validatortest/numbertest') {
    return Number(newValue);
  } else if (['/sample/arraytest', '/sample/validatortest/emptyarray', '/sample/validatortest/oneitemarray'].includes(xpath)) {
    if (!newValue || !('item' in newValue)) {
      return { 'item': [] };
    }
  } else if (['/sample/arraytest/item', '/sample/validatortest/emptyarray/item', '/sample/validatortest/oneitemarray/item'].includes(xpath)) {
    if (!currentValue) {
      return newValue;
    }
  } else if (xpath === '/validationerror') {
    throw new xml2js.ValidationError("Validation error!");
  }
  return newValue;
};

// shortcut, because it is quite verbose
const equ = assert.equal;

/*
The `validator` function validates the value at the XPath. It also transforms the value
if necessary to conform to the schema or other validation information being used. If there
is an existing value at this path it is supplied in `currentValue` (e.g. this is the second or
later item in an array).
If the validation fails it should throw a `ValidationError`.
*/

describe('parser', function () {
  
  
  test('parse with defaults', skeleton(undefined, function (r: { sample: { chartest: { _: unknown; }[]; cdatatest: { _: unknown; }[]; nochartest: { $: { misc: unknown; }; }[]; listtest: { item: unknown[]; }[]; tagcasetest: {}[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.chartest[0].$.desc, 'Test for CHARs');
    equ(r.sample.chartest[0]._, 'Character data here!');
    equ(r.sample.cdatatest[0].$.desc, 'Test for CDATA');
    equ(r.sample.cdatatest[0].$.misc, 'true');
    equ(r.sample.cdatatest[0]._, 'CDATA here!');
    equ(r.sample.nochartest[0].$.desc, 'No data');
    equ(r.sample.nochartest[0].$.misc, 'false');
    equ(r.sample.listtest[0].item[0]._, '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
    equ(r.sample.listtest[0].item[0].subitem[0], 'Foo(1)');
    equ(r.sample.listtest[0].item[0].subitem[1], 'Foo(2)');
    equ(r.sample.listtest[0].item[0].subitem[2], 'Foo(3)');
    equ(r.sample.listtest[0].item[0].subitem[3], 'Foo(4)');
    equ(r.sample.listtest[0].item[1], 'Qux.');
    equ(r.sample.listtest[0].item[2], 'Quux.');
    // determine number of items in object
    equ(Object.keys(r.sample.tagcasetest[0]).length, 3);
  }));

  test("parse with empty objects and functions", skeleton({ emptyTag: () => ({}) }, function (r: { sample: { emptytestanother: any[]; emptytest: any[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    const bool = r.sample.emptytestanother[0] === r.sample.emptytest[0];
    equ(bool, false);
  }));

  test("parse with explicitCharkey", skeleton({ explicitCharkey: true }, function (r: { sample: { chartest: { _: unknown; }[]; cdatatest: { _: unknown; }[]; nochartest: { $: { misc: unknown; }; }[]; listtest: { item: { _: unknown; }[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.chartest[0].$.desc, 'Test for CHARs');
    equ(r.sample.chartest[0]._, 'Character data here!');
    equ(r.sample.cdatatest[0].$.desc, 'Test for CDATA');
    equ(r.sample.cdatatest[0].$.misc, 'true');
    equ(r.sample.cdatatest[0]._, 'CDATA here!');
    equ(r.sample.nochartest[0].$.desc, 'No data');
    equ(r.sample.nochartest[0].$.misc, 'false');
    equ(r.sample.listtest[0].item[0]._, '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
    equ(r.sample.listtest[0].item[0].subitem[0]._, 'Foo(1)');
    equ(r.sample.listtest[0].item[0].subitem[1]._, 'Foo(2)');
    equ(r.sample.listtest[0].item[0].subitem[2]._, 'Foo(3)');
    equ(r.sample.listtest[0].item[0].subitem[3]._, 'Foo(4)');
    equ(r.sample.listtest[0].item[1]._, 'Qux.');
    equ(r.sample.listtest[0].item[2]._, 'Quux.');
  }))

  test("parse with mergeAttrs", skeleton({ mergeAttrs: true }, function (r: { sample: { chartest: { _: unknown; }[]; cdatatest: { _: unknown; }[]; nochartest: { misc: unknown[]; }[]; listtest: { attr: unknown[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.chartest[0].desc[0], 'Test for CHARs');
    equ(r.sample.chartest[0]._, 'Character data here!');
    equ(r.sample.cdatatest[0].desc[0], 'Test for CDATA');
    equ(r.sample.cdatatest[0].misc[0], 'true');
    equ(r.sample.cdatatest[0]._, 'CDATA here!');
    equ(r.sample.nochartest[0].desc[0], 'No data');
    equ(r.sample.nochartest[0].misc[0], 'false');
    equ(r.sample.listtest[0].item[0].subitem[0], 'Foo(1)');
    equ(r.sample.listtest[0].item[0].subitem[1], 'Foo(2)');
    equ(r.sample.listtest[0].item[0].subitem[2], 'Foo(3)');
    equ(r.sample.listtest[0].item[0].subitem[3], 'Foo(4)');
    equ(r.sample.listtest[0].item[1], 'Qux.');
    equ(r.sample.listtest[0].item[2], 'Quux.');
    equ(r.sample.listtest[0].single[0], 'Single');
    return equ(r.sample.listtest[0].attr[0], 'Attribute');
  }));

  test("parse with mergeAttrs and not explicitArray", skeleton({ mergeAttrs: true, explicitArray: false }, function (r: { sample: { chartest: { desc: unknown; _: unknown; }; cdatatest: { desc: unknown; misc: unknown; _: unknown; }; nochartest: { desc: unknown; misc: unknown; }; listtest: { item: unknown[]; single: unknown; attr: unknown; }; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.chartest.desc, 'Test for CHARs');
    equ(r.sample.chartest._, 'Character data here!');
    equ(r.sample.cdatatest.desc, 'Test for CDATA');
    equ(r.sample.cdatatest.misc, 'true');
    equ(r.sample.cdatatest._, 'CDATA here!');
    equ(r.sample.nochartest.desc, 'No data');
    equ(r.sample.nochartest.misc, 'false');
    equ(r.sample.listtest.item[0].subitem[0], 'Foo(1)');
    equ(r.sample.listtest.item[0].subitem[1], 'Foo(2)');
    equ(r.sample.listtest.item[0].subitem[2], 'Foo(3)');
    equ(r.sample.listtest.item[0].subitem[3], 'Foo(4)');
    equ(r.sample.listtest.item[1], 'Qux.');
    equ(r.sample.listtest.item[2], 'Quux.');
    equ(r.sample.listtest.single, 'Single');
    equ(r.sample.listtest.attr, 'Attribute');
  }));

  test("parse with explicitChildren", skeleton({ explicitChildren: true }, function (r: { sample: { $$: { chartest: { _: unknown; }[]; cdatatest: { _: unknown; }[]; nochartest: { $: { misc: unknown; }; }[]; listtest: { $$: { item: unknown[]; }; }[]; nochildrentest: { $$: unknown; }[]; tagcasetest: { $$: {}; }[]; }; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.$$.chartest[0].$.desc, 'Test for CHARs');
    equ(r.sample.$$.chartest[0]._, 'Character data here!');
    equ(r.sample.$$.cdatatest[0].$.desc, 'Test for CDATA');
    equ(r.sample.$$.cdatatest[0].$.misc, 'true');
    equ(r.sample.$$.cdatatest[0]._, 'CDATA here!');
    equ(r.sample.$$.nochartest[0].$.desc, 'No data');
    equ(r.sample.$$.nochartest[0].$.misc, 'false');
    equ(r.sample.$$.listtest[0].$$.item[0]._, '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
    equ(r.sample.$$.listtest[0].$$.item[0].$$.subitem[0], 'Foo(1)');
    equ(r.sample.$$.listtest[0].$$.item[0].$$.subitem[1], 'Foo(2)');
    equ(r.sample.$$.listtest[0].$$.item[0].$$.subitem[2], 'Foo(3)');
    equ(r.sample.$$.listtest[0].$$.item[0].$$.subitem[3], 'Foo(4)');
    equ(r.sample.$$.listtest[0].$$.item[1], 'Qux.');
    equ(r.sample.$$.listtest[0].$$.item[2], 'Quux.');
    equ(r.sample.$$.nochildrentest[0].$$, undefined);
    // determine number of items in object
    equ(Object.keys(r.sample.$$.tagcasetest[0].$$).length, 3);
  }));

  test("parse with explicitChildren and preserveChildrenOrder", skeleton({ explicitChildren: true, preserveChildrenOrder: true }, function (r: { sample: { $$: { $$: { _: unknown; }[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.$$[10]['#name'], 'ordertest');
    equ(r.sample.$$[10].$$[0]['#name'], 'one');
    equ(r.sample.$$[10].$$[0]._, '1');
    equ(r.sample.$$[10].$$[1]['#name'], 'two');
    equ(r.sample.$$[10].$$[1]._, '2');
    equ(r.sample.$$[10].$$[2]['#name'], 'three');
    equ(r.sample.$$[10].$$[2]._, '3');
    equ(r.sample.$$[10].$$[3]['#name'], 'one');
    equ(r.sample.$$[10].$$[3]._, '4');
    equ(r.sample.$$[10].$$[4]['#name'], 'two');
    equ(r.sample.$$[10].$$[4]._, '5');
    equ(r.sample.$$[10].$$[5]['#name'], 'three');
    equ(r.sample.$$[10].$$[5]._, '6');
  }));

  test("parse with explicitChildren and charsAsChildren and preserveChildrenOrder", skeleton({ explicitChildren: true, preserveChildrenOrder: true }, function (r: { sample: { $$: { $$: { _: unknown; }[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.$$[10]['#name'], 'ordertest');
    equ(r.sample.$$[10].$$[0]['#name'], 'one');
    equ(r.sample.$$[10].$$[0]._, '1');
    equ(r.sample.$$[10].$$[1]['#name'], 'two');
    equ(r.sample.$$[10].$$[1]._, '2');
    equ(r.sample.$$[10].$$[2]['#name'], 'three');
    equ(r.sample.$$[10].$$[2]._, '3');
    equ(r.sample.$$[10].$$[3]['#name'], 'one');
    equ(r.sample.$$[10].$$[3]._, '4');
    equ(r.sample.$$[10].$$[4]['#name'], 'two');
    equ(r.sample.$$[10].$$[4]._, '5');
    equ(r.sample.$$[10].$$[5]['#name'], 'three');
    equ(r.sample.$$[10].$$[5]._, '6');
  }));

  test("parse with explicitChildren and charsAsChildren and preserveChildrenOrder and includeWhiteChars", skeleton({ explicitChildren: true, preserveChildrenOrder: true, charsAsChildren: true }, function (r: { sample: { $$: { $$: { _: unknown; }[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.$$[10]['#name'], 'ordertest');
    equ(r.sample.$$[10].$$[0]['#name'], 'one');
    equ(r.sample.$$[10].$$[0]._, '1');
    equ(r.sample.$$[10].$$[1]['#name'], 'two');
    equ(r.sample.$$[10].$$[1]._, '2');
    equ(r.sample.$$[10].$$[2]['#name'], 'three');
    equ(r.sample.$$[10].$$[2]._, '3');
    equ(r.sample.$$[10].$$[3]['#name'], 'one');
    equ(r.sample.$$[10].$$[3]._, '4');
    equ(r.sample.$$[10].$$[4]['#name'], 'two');
    equ(r.sample.$$[10].$$[4]._, '5');
    equ(r.sample.$$[10].$$[5]['#name'], 'three');
    equ(r.sample.$$[10].$$[5]._, '6');

    // test text ordering with XML nodes in the middle
    equ(r.sample.$$[17]['#name'], 'textordertest');
    equ(r.sample.$$[17].$$[0]['#name'], '__text__');
    equ(r.sample.$$[17].$$[0]._, 'this is text with ');
    equ(r.sample.$$[17].$$[1]['#name'], 'b');
    equ(r.sample.$$[17].$$[1]._, 'markup');
    equ(r.sample.$$[17].$$[2]['#name'], 'em');
    equ(r.sample.$$[17].$$[2]._, 'like this');
    equ(r.sample.$$[17].$$[3]['#name'], '__text__');
    equ(r.sample.$$[17].$$[3]._, ' in the middle');
  }));

  test("parse with explicitChildren and charsAsChildren and preserveChildrenOrder and includeWhiteChars and normalize", skeleton({ explicitChildren: true, preserveChildrenOrder: true, charsAsChildren: true, includeWhiteChars: true }, function (r: { sample: { $$: { $$: { _: unknown; }[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    // normalized whitespace-only text node becomes empty string
    equ(r.sample.$$[35]['#name'], 'textordertest');
    equ(r.sample.$$[35].$$[0]['#name'], '__text__');
    equ(r.sample.$$[35].$$[0]._, 'this is text with');
    equ(r.sample.$$[35].$$[1]['#name'], 'b');
    equ(r.sample.$$[35].$$[1]._, 'markup');
    equ(r.sample.$$[35].$$[2]['#name'], '__text__');
    equ(r.sample.$$[35].$$[2]._, '');
    equ(r.sample.$$[35].$$[3]['#name'], 'em');
    equ(r.sample.$$[35].$$[3]._, 'like this');
    equ(r.sample.$$[35].$$[4]['#name'], '__text__');
    equ(r.sample.$$[35].$$[4]._, 'in the middle');
  }));

  test("element without children", skeleton({ explicitChildren: true }, function (r: { sample: { $$: { nochildrentest: { $$: unknown; }[]; }; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    return equ(r.sample.$$.nochildrentest[0].$$, undefined);
  }));

  test("parse with explicitChildren and charsAsChildren", skeleton({ explicitChildren: true, charsAsChildren: true }, function (r: { sample: { $$: { chartest: { $$: { _: unknown; }; }[]; cdatatest: { $$: { _: unknown; }; }[]; listtest: { $$: { item: { $$: { _: unknown; }; }[]; }; }[]; tagcasetest: { $$: {}; }[]; }; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.$$.chartest[0].$$._, 'Character data here!');
    equ(r.sample.$$.cdatatest[0].$$._, 'CDATA here!');
    equ(r.sample.$$.listtest[0].$$.item[0].$$._, '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
    // determine number of items in object
    equ(Object.keys(r.sample.$$.tagcasetest[0].$$).length, 3);
  }))

  test('text trimming, normalize', skeleton({ trim: true, normalize: true }, (r: { sample: { whitespacetest: { _: unknown; }[]; }; }) => equ(r.sample.whitespacetest[0]._, 'Line One Line Two')))

  test('text trimming, no normalizing', skeleton({ trim: true, normalize: false }, (r: { sample: { whitespacetest: { _: unknown; }[]; }; }) => equ(r.sample.whitespacetest[0]._, 'Line One\n        Line Two')))

  test('text no trimming, normalize', skeleton({ trim: true, normalize: false }, (r: { sample: { whitespacetest: { _: unknown; }[]; }; }) => equ(r.sample.whitespacetest[0]._, 'Line One\n        Line Two')));

  test('text no trimming, no normalize', skeleton({ trim: false, normalize: true }, (r: { sample: { whitespacetest: { _: unknown; }[]; }; }) => equ(r.sample.whitespacetest[0]._, 'Line One Line Two')));

  test("enabled root node elimination", skeleton({ __xmlString: '<root></root>', explicitRoot: false }, function (r: unknown) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    assert.deepEqual(r, '');
  }));

  test("disabled root node elimination", skeleton({ __xmlString: '<root></root>', explicitRoot: true }, (r: unknown) => assert.deepEqual(r, { root: '' })))

  test("default empty tag result", skeleton({ __xmlString: '<root></root>', explicitRoot: true }, (r: unknown) => assert.deepEqual(r, { root: '' })))

  test("empty tag result specified null", skeleton({ emptyTag: null }, (r: { sample: { emptytest: unknown[]; }; }) => equ(r.sample.emptytest[0], null)))

  test("invalid empty XML file", skeleton({ __xmlString: ' ' }, (r: unknown) => equ(r, null)))

  test("enabled normalizeTags", skeleton({ normalizeTags: true }, function (r: { sample: { tagcasetest: {}; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    return equ(Object.keys(r.sample.tagcasetest).length, 1);
  }))

  test("parse with custom char and attribute object keys", skeleton({ attrkey: 'attrobj', charkey: 'charobj' }, function (r: { sample: { chartest: { charobj: unknown; }[]; cdatatest: { charobj: unknown; }[]; cdatawhitespacetest: { charobj: unknown; }[]; nochartest: { attrobj: { misc: unknown; }; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.chartest[0].attrobj.desc, 'Test for CHARs');
    equ(r.sample.chartest[0].charobj, 'Character data here!');
    equ(r.sample.cdatatest[0].attrobj.desc, 'Test for CDATA');
    equ(r.sample.cdatatest[0].attrobj.misc, 'true');
    equ(r.sample.cdatatest[0].charobj, 'CDATA here!');
    equ(r.sample.cdatawhitespacetest[0].charobj, '   ');
    equ(r.sample.nochartest[0].attrobj.desc, 'No data');
    return equ(r.sample.nochartest[0].attrobj.misc, 'false');
  }))

  test("child node without explicitArray", skeleton({ explicitArray: false }, function (r: { sample: { arraytest: { item: { subitem: unknown[]; }[]; }; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.arraytest.item[0].subitem, 'Baz.');
    equ(r.sample.arraytest.item[1].subitem[0], 'Foo.');
    return equ(r.sample.arraytest.item[1].subitem[1], 'Bar.');
  }))

  test("child node with explicitArray", skeleton({ explicitArray: true }, function (r: { sample: { arraytest: { item: { subitem: unknown[]; }[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.arraytest[0].item[0].subitem[0], 'Baz.');
    equ(r.sample.arraytest[0].item[1].subitem[0], 'Foo.');
    equ(r.sample.arraytest[0].item[1].subitem[1], 'Bar.');
  }))

  test("ignore attributes", skeleton({ ignoreAttrs: true }, function (r: { sample: { chartest: unknown[]; cdatatest: unknown[]; nochartest: unknown[]; listtest: { item: unknown[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.chartest[0], 'Character data here!');
    equ(r.sample.cdatatest[0], 'CDATA here!');
    equ(r.sample.nochartest[0], '');
    equ(r.sample.listtest[0].item[0]._, '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
    equ(r.sample.listtest[0].item[0].subitem[0], 'Foo(1)');
    equ(r.sample.listtest[0].item[0].subitem[1], 'Foo(2)');
    equ(r.sample.listtest[0].item[0].subitem[2], 'Foo(3)');
    equ(r.sample.listtest[0].item[0].subitem[3], 'Foo(4)');
    equ(r.sample.listtest[0].item[1], 'Qux.');
    equ(r.sample.listtest[0].item[2], 'Quux.');
  }))

  test("simple callback mode", function (done) {
    const x2js = new xml2js.Parser();
    return fs.readFile(fileName, {encoding:"utf-8"},function (err, data) {
      equ(err, null);
      return x2js.parseString(data, function (err, r) {
        equ(err, null);
        // just a single test to check whether we parsed anything
        equ(r.sample.chartest[0]._, 'Character data here!');
        done();
      });
    });
  })

  test("simple callback with options", function (done) {
    return fs.readFile(fileName,{encoding:"utf-8"}, (err, data) => xml2js.parseString(data, {
      trim: true,
      normalize: true
    },
      function (err: any, r: { sample: { whitespacetest: { _: unknown; }[]; }; }) {
        console.log(r);
        equ(r.sample.whitespacetest[0]._, 'Line One Line Two');
        done()
      }));
  })

  test("double parse", function (done) {
    const x2js = new xml2js.Parser();
    return fs.readFile(fileName, {encoding:"utf-8"}, function (err, data) {
      equ(err, null);
      return x2js.parseString(data, function (err, r) {
        equ(err, null);
        // make sure we parsed anything
        equ(r.sample.chartest[0]._, 'Character data here!');
        return x2js.parseString(data, function (err, r) {
          equ(err, null);
          equ(r.sample.chartest[0]._, 'Character data here!');
          done();
        });
      });
    });
  })

  test("element with garbage XML", function (done) {
    const x2js = new xml2js.Parser();
    const xmlString = "<<>fdfsdfsdf<><<><??><<><>!<>!<!<>!.";
    return x2js.parseString(xmlString, function (err, result) {
      assert.notEqual(err, null);
      done();
    });
  })

  test("simple function without options", function (done) {
    return fs.readFile(fileName,{encoding:"utf-8"}, (err, data) => xml2js.parseString(data, function (err: unknown, r: { sample: { chartest: { _: unknown; }[]; }; }) {
      equ(err, null);
      equ(r.sample.chartest[0]._, 'Character data here!');
      done();
    }));
  })

  test("simple function with options", function (done) {
    return fs.readFile(fileName, (err, data) => // well, {} still counts as option, right?
      xml2js.parseString(data, {}, function (err: unknown, r: { sample: { chartest: { _: unknown; }[]; }; }) {
        equ(err, null);
        equ(r.sample.chartest[0]._, 'Character data here!');
        done()
      }));
  })

  test("async execution", function (done) {
    return fs.readFile(fileName, (err, data) => xml2js.parseString(data, { async: true }, function (err: unknown, r: { sample: { chartest: { _: unknown; }[]; }; }) {
      equ(err, null);
      equ(r.sample.chartest[0]._, 'Character data here!');
      done();
    }));
  })

  test("validator", skeleton({ validator }, function (r: { sample: { validatortest: { oneitemarray: { item: unknown[]; }[]; }[]; arraytest: { item: { subitem: unknown[]; }[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(typeof r.sample.validatortest[0].stringtest[0], 'string');
    equ(typeof r.sample.validatortest[0].numbertest[0], 'number');
    assert.ok(r.sample.validatortest[0].emptyarray[0].item instanceof Array);
    equ(r.sample.validatortest[0].emptyarray[0].item.length, 0);
    assert.ok(r.sample.validatortest[0].oneitemarray[0].item instanceof Array);
    equ(r.sample.validatortest[0].oneitemarray[0].item.length, 1);
    equ(r.sample.validatortest[0].oneitemarray[0].item[0], 'Bar.');
    assert.ok(r.sample.arraytest[0].item instanceof Array);
    equ(r.sample.arraytest[0].item.length, 2);
    equ(r.sample.arraytest[0].item[0].subitem[0], 'Baz.');
    equ(r.sample.arraytest[0].item[1].subitem[0], 'Foo.');
    return equ(r.sample.arraytest[0].item[1].subitem[1], 'Bar.');
  }))

  test("validation error", function (done) {
    const x2js = new xml2js.Parser({ validator });
    return x2js.parseString('<validationerror/>', function (err, r) {
      equ(err.message, 'Validation error!');
      done();
    });
  })

  test("error throwing", function (done) {
    const xml = '<?xml version="1.0" encoding="utf-8"?><test>content is ok<test>';
    try {
      xml2js.parseString(xml, function (err: any, parsed: any) {
        throw new Error('error throwing in callback');
      });
      throw new Error('error throwing outside');
    } catch (e) {
      // the stream is finished by the time the parseString method is called
      // so the callback, which is synchronous, will bubble the inner error
      // out to here, make sure that happens
      equ(e.message, 'error throwing in callback');
      done();
    }
  })

  test('error throwing after an error (async)', function (done) {
    const xml = '<?xml version="1.0" encoding="utf-8"?><test node is not okay>content is ok</test node is not okay>';
    let nCalled = 0;
    return xml2js.parseString(xml, { async: true }, function (err: any, parsed: any) {
      // Make sure no future changes break this
      ++nCalled;
      if (nCalled > 1) {
        done.fail('callback called multiple times');
      }
    });
  });

  test("xmlns", skeleton({ xmlns: true }, function (r: { sample: { [x: string]: { middle: { $ns: { uri: unknown; }; }[]; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample["pfx:top"][0].$ns.local, 'top');
    equ(r.sample["pfx:top"][0].$ns.uri, 'http://foo.com');
    equ(r.sample["pfx:top"][0].$["pfx:attr"].value, 'baz');
    equ(r.sample["pfx:top"][0].$["pfx:attr"].local, 'attr');
    equ(r.sample["pfx:top"][0].$["pfx:attr"].uri, 'http://foo.com');
    equ(r.sample["pfx:top"][0].middle[0].$ns.local, 'middle');
    equ(r.sample["pfx:top"][0].middle[0].$ns.uri, 'http://bar.com');
  }))

  test("callback should be called once", function (done) {
    const xml = '<?xml version="1.0" encoding="utf-8"?><test>test</test>';
    let i = 0;
    try {
      return xml2js.parseString(xml, function (err: any, parsed: any) {
        i = i + 1;
        // throw something custom
        throw new Error('Custom error message');
      });
    } catch (e) {
      equ(i, 1);
      equ(e.message, 'Custom error message');
      return done;
    }
  })

  test("no error event after end", function (done) {
    const xml = '<?xml version="1.0" encoding="utf-8"?><test>test</test>';
    let i = 0;
    const x2js = new xml2js.Parser();
    x2js.on('error', () => i = i + 1);

    x2js.on('end', function () {
      //This is a userland callback doing something with the result xml.
      //Errors in here should not be passed to the parser's 'error' callbacks
      //Errors here should be propagated so that the user can see them and
      //fix them.
      throw new Error('some error in user-land');
    });

    try {
      x2js.parseString(xml);
    } catch (e) {
      equ(e.message, 'some error in user-land');
    }

    equ(i, 0);
    done();
  })

  test("CDATA whitespaces result", function (done) {
    const xml = '<spacecdatatest><![CDATA[ ]]></spacecdatatest>';
    return xml2js.parseString(xml, function (err: any, parsed: { spacecdatatest: unknown; }) {
      equ(parsed.spacecdatatest, ' ');
      done()
    });
  })

  test("escaped CDATA result", function (done) {
    const xml = '<spacecdatatest><![CDATA[]]]]><![CDATA[>]]></spacecdatatest>';
    return xml2js.parseString(xml, function (err: any, parsed: { spacecdatatest: unknown; }) {
      equ(parsed.spacecdatatest, ']]>');
      done()
    });
  })

  test('non-strict parsing', function (done) {
    const xml = '<spacecdatatest><![CDATA[]]]]><![CDATA[>]]></spacecdatatest>';
    return xml2js.parseString(xml, function (err: any, parsed: { spacecdatatest: unknown; }) {
      equ(parsed.spacecdatatest, ']]>');
      done();
    });
  })

  test("not closed but well formed xml", function (done) {
    const xml = "<test>";
    return xml2js.parseString(xml, function (err: { message: unknown; }, parsed: any) {
      assert.equal(err.message, 'Unclosed root tag\nLine: 0\nColumn: 6\nChar: ');
      done();
    });
  })

  test('cdata-named node', function (done) {
    const xml = "<test><cdata>hello</cdata></test>";
    return xml2js.parseString(xml, function (err: any, parsed: { test: { cdata: unknown[]; }; }) {
      assert.equal(parsed.test.cdata[0], 'hello');
      done();
    });
  })

  test("onend with empty xml", function (done) {
    const xml = "<?xml version=\"1.0\"?>";
    return xml2js.parseString(xml, function (err: any, parsed: unknown) {
      assert.equal(parsed, null);
      done();
    });
  })

  test("parsing null", function (done) {
    const xml = null;
    return xml2js.parseString(xml, function (err: unknown, parsed: any) {
      assert.notEqual(err, null);
      done();
    });
  })

  test("parsing undefined", function (done) {
    const xml = undefined;
    return xml2js.parseString(xml, function (err: unknown, parsed: any) {
      assert.notEqual(err, null);
      done();
    });
  })

  test("chunked processing", function (done) {
    const xml = "<longstuff>abcdefghijklmnopqrstuvwxyz</longstuff>";
    return xml2js.parseString(xml, { chunkSize: 10 }, function (err: unknown, parsed: { longstuff: unknown; }) {
      equ(err, null);
      equ(parsed.longstuff, 'abcdefghijklmnopqrstuvwxyz');
      done();
    });
  })

  test('single attrNameProcessors', skeleton({ attrNameProcessors: [nameToUpperCase] }, function (r: { sample: { attrNameProcessTest: { $: { hasOwnProperty: (arg0: string) => unknown; }; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.attrNameProcessTest[0].$.hasOwnProperty('CAMELCASEATTR'), true);
    equ(r.sample.attrNameProcessTest[0].$.hasOwnProperty('LOWERCASEATTR'), true);
  }))

  test('multiple attrNameProcessors', skeleton({ attrNameProcessors: [nameToUpperCase, nameCutoff] }, function (r: { sample: { attrNameProcessTest: { $: { hasOwnProperty: (arg0: string) => unknown; }; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.attrNameProcessTest[0].$.hasOwnProperty('CAME'), true);
    equ(r.sample.attrNameProcessTest[0].$.hasOwnProperty('LOWE'), true);
  }))

  test('single attrValueProcessors', skeleton({ attrValueProcessors: [nameToUpperCase] }, function (r: { sample: { attrValueProcessTest: { $: { lowerCaseAttr: unknown; }; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.attrValueProcessTest[0].$.camelCaseAttr, 'CAMELCASEATTRVALUE');
    equ(r.sample.attrValueProcessTest[0].$.lowerCaseAttr, 'LOWERCASEATTRVALUE');
  }))

  test('multiple attrValueProcessors', skeleton({ attrValueProcessors: [nameToUpperCase, nameCutoff] }, function (r: { sample: { attrValueProcessTest: { $: { lowerCaseAttr: unknown; }; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.attrValueProcessTest[0].$.camelCaseAttr, 'CAME');
    equ(r.sample.attrValueProcessTest[0].$.lowerCaseAttr, 'LOWE');
  }))

  test('single valueProcessors', skeleton({ valueProcessors: [nameToUpperCase] }, function (r: { sample: { valueProcessTest: unknown[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.valueProcessTest[0], 'SOME VALUE');
  }))

  test('multiple valueProcessors', skeleton({ valueProcessors: [nameToUpperCase, nameCutoff] }, function (r: { sample: { valueProcessTest: unknown[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.valueProcessTest[0], 'SOME');
  }))

  test('single tagNameProcessors', skeleton({ tagNameProcessors: [nameToUpperCase] }, function (r: { hasOwnProperty: (arg0: string) => unknown; SAMPLE: { hasOwnProperty: (arg0: string) => unknown; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.hasOwnProperty('SAMPLE'), true);
    equ(r.SAMPLE.hasOwnProperty('TAGNAMEPROCESStest('), true);
  }))

  test('single tagNameProcessors in simple callback', function (done) {
    return fs.readFile(fileName, (err, data) => xml2js.parseString(data, { tagNameProcessors: [nameToUpperCase] }, function (err: any, r: { hasOwnProperty: (arg0: string) => unknown; SAMPLE: { hasOwnProperty: (arg0: string) => unknown; }; }) {
      console.log('Result object: ' + util.inspect(r, false, 10));
      equ(r.hasOwnProperty('SAMPLE'), true);
      equ(r.SAMPLE.hasOwnProperty('TAGNAMEPROCESStest('), true);
      done();
    }));
  })

  test('multiple tagNameProcessors', skeleton({ tagNameProcessors: [nameToUpperCase, nameCutoff] }, function (r: { hasOwnProperty: (arg0: string) => unknown; SAMP: { hasOwnProperty: (arg0: string) => unknown; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.hasOwnProperty('SAMP'), true);
    equ(r.SAMP.hasOwnProperty('TAGN'), true);
  }))

  test('attrValueProcessors key param', skeleton({ attrValueProcessors: [replaceValueByName] }, function (r: { sample: { attrValueProcessTest: { $: { lowerCaseAttr: unknown; }; }[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.attrValueProcessTest[0].$.camelCaseAttr, 'camelCaseAttr');
    equ(r.sample.attrValueProcessTest[0].$.lowerCaseAttr, 'lowerCaseAttr');
  }))

  test('valueProcessors key param', skeleton({ valueProcessors: [replaceValueByName] }, function (r: { sample: { valueProcessTest: unknown[]; }; }) {
    console.log('Result object: ' + util.inspect(r, false, 10));
    equ(r.sample.valueProcessTest[0], 'valueProcesstest(');
  }))

  test('parseStringPromise parsing', async function (done) {
    const x2js = new xml2js.Parser();
    try {
      const data = await readFilePromise(fileName);
      const r = await x2js.parseStringPromise(data);
      // just a single test to check whether we parsed anything
      equ(r.sample.chartest[0]._, 'Character data here!');
      done();
    } catch (err) {
      return done.fail('Should not error');
    }
  })

  test('parseStringPromise with bad input', async function (done) {
    const x2js = new xml2js.Parser();
    try {
      const r = await x2js.parseStringPromise("< a moose bit my sister>");
      return done.fail('Should fail');
    } catch (err) {
      assert.notEqual(err, null);
      done();
    }
  })

  test('global parseStringPromise parsing', async function (done) {
    try {
      const data = await readFilePromise(fileName);
      const r = await xml2js.parseStringPromise(data);
      assert.notEqual(r, null);
      equ(r.sample.listtest[0].item[0].subitem[0], 'Foo(1)');
      done();
    } catch (err) {
      return done.fail('Should not error');
    }
  })

  test('global parseStringPromise with options', async function (done) {
    try {
      const data = await readFilePromise(fileName);
      const r = await xml2js.parseStringPromise(data, {
        trim: true,
        normalize: true
      }
      );
      assert.notEqual(r, null);
      equ(r.sample.whitespacetest[0]._, 'Line One Line Two');
      done();
    } catch (err) {
      return done.fail('Should not error');
    }
  });

  test('global parseStringPromise with bad input', async function (done) {
    try {
      await xml2js.parseStringPromise("< a moose bit my sister>");
      return done.fail('Should fail');
    } catch (err) {
      assert.notEqual(err, null);
      done();
    }
  });
}); 
