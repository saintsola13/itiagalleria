(function(){
  if (typeof NFTS === 'undefined') return;
  var extra = window.ITIA_EXTRA || [];
  for (var i = extra.length - 1; i >= 0; i--) NFTS.unshift(extra[i]);
})();
