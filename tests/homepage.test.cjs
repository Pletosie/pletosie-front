const {test}=require('node:test');
const assert=require('node:assert/strict');
const {homepageProducts,defaultHomepage}=require('../src/lib/homepage.ts');
const products=[{id:'one',category:'Robes',published:true},{id:'two',category:'Hauts',published:true},{id:'draft',category:'Jupes',published:false}];
test('keeps the chosen order and removes missing or unpublished products',()=>{assert.deepEqual(homepageProducts(['two','missing','draft','one'],products).map(p=>p.id),['two','one']);});
test('keeps a section empty when the administrator clears it',()=>{assert.deepEqual(homepageProducts([],products),[]);});
test('the initial composition includes only published products',()=>{const home=defaultHomepage(products);assert.deepEqual(home.selection,['one','two']);assert.deepEqual(home.looks,['one','two']);});
