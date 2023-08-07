const { convertXmlToJson } = require('../dataFormater/index');
const axios = require('axios');

const goodreadsApiKey = process.env['goodreadsApiKey'];
const goodreadsDomain = 'https://www.goodreads.com';

async function searchBooks(req, res) {
  const {
    q,
    field,
    sort,
    page,
    pageSize,
    order
  } = req.query;

  try {
    const apiUrl = `${goodreadsDomain}/search/index.xml`;
    const response = await axios.get(apiUrl, {
      params: {
        q,
        key: goodreadsApiKey,
        'search[field]': field,
      },
    });
    const responseJSON = convertXmlToJson(response.data);
    let results = responseJSON?.GoodreadsResponse?.search[0]?.results[0]?.work || [];
    
    // Calculate the start and end indices for the current page
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize);

    results = sortResults(results, sort, order);

    // Extract the subset of results for the current page
    const paginatedResults = results.slice(startIndex, endIndex);

    // Add a 'relevance' property to each result for demonstration
    paginatedResults.forEach((result, index) => {
      result['relevance'] = startIndex + index;
    });
    
    // Construct a response object with pagination metadata
    const pagination = {
      currentPage: parseInt(page),
      itemsPerPage: parseInt(pageSize),
      totalItems: results.length,
      totalPages: Math.ceil(results.length / pageSize)
    };

    return res.status(200).json({
      results: paginatedResults,
      pagination: pagination
    });
  } catch (error) {
    console.error('Error searching for books:', error.message);
    return res.status(500).json({ error: 'Could not find book' });
  }
}

function sortResults(results, selectedSort, order) {
  let sortedResults = results.slice();
  switch(selectedSort) {
    case 'title':
      sortedResults.sort((a, b) => {
        const titleA = a.best_book[0].title[0];
        const titleB = b.best_book[0].title[0];
          return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
        });
      break;
    case 'author':
      sortedResults.sort((a, b) => {
        const authorNameA = a.best_book[0].author[0].name[0];
        const authorNameB = b.best_book[0].author[0].name[0];
        return authorNameA.localeCompare(authorNameB, undefined, { sensitivity: 'base' });
      });
      break;
    case 'date':
      sortedResults = sortedResults.sort((a, b) => {
        const yearA = parseInt(a.original_publication_year[0]?._ || '0', 10);
        const yearB = parseInt(b.original_publication_year[0]?._ || '0', 10);
        const monthA = parseInt(a.original_publication_month[0]?._ || '0', 10);
        const monthB = parseInt(b.original_publication_month[0]?._ || '0', 10);
        if (isNaN(yearA) || isNaN(yearB)) {
          if (!isNaN(yearA)) {
            return -1;
          }
          if (!isNaN(yearB)) {
            return 1;
          }
          return monthA - monthB;
        }

        if (yearA !== yearB) {
          return yearA - yearB;
        } else {
          return monthA - monthB;
        }
      });
      break;
    case 'rating':
      sortedResults.sort((a, b) => {
        const ratingA = parseFloat(a.average_rating[0]);
        const ratingB = parseFloat(b.average_rating[0]);
        return ratingB - ratingA;
      });
      break;
    case 'relevance':
      sortedResults.sort((a, b) => {
        return a.relevance - b.relevance;
      });
      break;
  }
  if(!order) {
    return sortedResults.reverse();
  } 
  return sortedResults || [];
}

module.exports = {
  searchBooks,
};