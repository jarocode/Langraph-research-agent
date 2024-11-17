export interface WikipediaSearchResult {
  pageNumber: number;
  pageId: number;
  pageUrl: string;
  fullContent: string;
}

export async function queryMediaWiki(
  query: string
): Promise<WikipediaSearchResult[]> {
  const apiUrl = "https://en.wikipedia.org/w/api.php";

  try {
    const searchParams = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      format: "json",
    });

    const searchResponse = await fetch(`${apiUrl}?${searchParams.toString()}`);
    const searchData = await searchResponse.json();

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

    return results;
  } catch (error) {
    console.error("Error fetching Wikipedia data:", error);
    return [];
  }
}
