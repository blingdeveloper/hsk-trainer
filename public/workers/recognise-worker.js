/* Classic Web Worker: runs HanziLookupJS off the main thread, fully offline.
   Messages in:  { id, strokes: number[][][], limit }
   Messages out: { id, ready } | { id, candidates: string[] } | { id, error } */
importScripts('../vendor/hanzilookup/hanzilookup.min.js');

var ready = new Promise(function (resolve, reject) {
  HanziLookup.init('mmah', '../vendor/hanzilookup/mmah.json', function (ok) {
    if (ok) resolve();
    else reject(new Error('Recognition data failed to load'));
  });
});
var matcher;

self.onmessage = function (e) {
  var msg = e.data;
  ready.then(
    function () {
      if (!msg.strokes) {
        self.postMessage({ id: msg.id, ready: true });
        return;
      }
      matcher = matcher || new HanziLookup.Matcher('mmah');
      var analyzed = new HanziLookup.AnalyzedCharacter(msg.strokes);
      matcher.match(analyzed, msg.limit || 8, function (matches) {
        self.postMessage({
          id: msg.id,
          candidates: matches.map(function (m) { return m.character; }),
        });
      });
    },
    function (err) {
      self.postMessage({ id: msg.id, error: String(err && err.message ? err.message : err) });
    },
  );
};
