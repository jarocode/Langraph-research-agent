export interface WikipediaSearchResult {
  pageNumber: number;
  pageId: number;
  pageUrl: string;
  fullContent: string;
}

export const queryMediaWiki = async (
  query: string
): Promise<WikipediaSearchResult[]> => {
  const apiUrl = "https://en.wikipedia.org/w/api.php";

  console.log("searchWiki-1...");

  try {
    const searchParams = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      format: "json",
    });

    const searchResponse = await fetch(`${apiUrl}?${searchParams.toString()}`);
    console.log("searchWiki-2...");
    const searchData = await searchResponse.json();
    console.log("searchWiki-3...");

    const searchResults = searchData.query.search;

    const results: WikipediaSearchResult[] = [];

    for (const [index, result] of searchResults.entries()) {
      const pageId = result.pageid;
      const pageTitle = result.title;
      const pageUrl = `https://en.wikipedia.org/wiki/${pageTitle.replace(
        " ",
        "_"
      )}`;

      const contentParams = new URLSearchParams({
        action: "query",
        prop: "revisions",
        rvprop: "content",
        pageids: pageId,
        format: "json",
      });

      const contentResponse = await fetch(
        `${apiUrl}?${contentParams.toString()}`
      );

      console.log("searchWiki-4...");
      const contentData = await contentResponse.json();

      // const pageContent = contentData.query.pages[pageId].revisions[0].content;
      const pageContent = contentData.query.pages[pageId].revisions[0]["*"];

      results.push({
        pageNumber: index + 1,
        pageUrl,
        pageId,
        fullContent: pageContent,
      });
    }

    console.log("searchWikiresults:", results);

    return results;
  } catch (error) {
    console.error("Error fetching Wikipedia data:", error);
    return [];
  }
};
