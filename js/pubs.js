var request = new XMLHttpRequest();
var pubmedUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=(Cairns+MJ[Author])+AND+(Newcastle+OR+Sydney)+AND+Australia*&retmax=10&sort=pub+date";
request.open("GET", pubmedUrl, true);
request.onload = function(e) {
  if (request.readyState === 4 && request.status === 200) {
    var xml = request.responseXML;
    var pubids = xml.getElementsByTagName("Id");
    var pubmedIds = "";
    for (var i = 0; i < pubids.length; i++) {
      pubmedIds += pubids[i].childNodes[0].nodeValue + ",";
    }
    pubmedIds = pubmedIds.replace(/,$/g, "");
    var pubmedUrl2 = ("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=" + pubmedIds);
    var request2 = new XMLHttpRequest();
    request2.open("GET", pubmedUrl2, false);
    request2.onload = function(f) {
      var xml2 = request2.responseXML;
      var ids = xml2.getElementsByTagName("DocSum");
      for (var j = 0; j < ids.length; j++) {
        var pubnames = ids[j].getElementsByTagName("Item");
        var authors = [];
        var year = "";
        var title = "";
        var source = "";
        for (var i = 0; i < pubnames.length; i++) {
          n = pubnames[i].getAttribute("Name");
          if (n == "Author") {
            authors.push(pubnames[i].childNodes[0].nodeValue);
            var authorlist = authors[0].split(" ")[0];
            if (authors.length == 2) {
              authorlist += " and " + authors[1].split(" ")[0];
            } else if (authors.length == 3) {
              authorlist += ", " + authors[1].split(" ")[0] + " and " + authors[2].split(" ")[0];
            } else {
                authorlist += " et al.";
            }
          } else if (n == "PubDate") {
            year = pubnames[i].childNodes[0].nodeValue.substring(0,4);
          } else if (n == "Title") {
            title = pubnames[i].childNodes[0].nodeValue;
            title = title.replace(/.$/g, "");
          } else if (n == "Source") {
            source = pubnames[i].childNodes[0].nodeValue;
          }
        }
        var citation = (authorlist + " (" + year + "). <i>" + title + "</i>. " + source + ".");
        document.getElementById("publicationIDs").innerHTML += ("<li>" + citation + "</li>");
        // for (var i = 0; i < pubnames.length; i++) {
        //   n = pubnames[i].getAttribute("Name");
        //   if (n == "Title") {
        //     document.getElementById("publicationIDs").innerHTML += ("<p>" + pubnames[i].childNodes[0].nodeValue + "</p>");
        //   }
        // }
      }
      // var pubnames = xml2.getElementsByTagName("Item");
    }
    request2.onerror = function(f) {
      document.getElementById("publicationIDs").innerHTML += request.statusText;
    }
    request2.send();
  }
}
request.onerror = function(e) {
  document.getElementById("publicationIDs").innerHTML += request.statusText;
}
request.send();
