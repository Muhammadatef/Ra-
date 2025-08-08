const addCompanyFilter = (req, res, next) => {
  if (!req.user || !req.user.company_id) {
    return res.status(401).json({ error: 'User company information required' });
  }

  // Add company_id to query parameters for automatic filtering
  req.companyId = req.user.company_id;
  
  // Store original query for logging
  req.originalQuery = { ...req.query };
  
  // Automatically add company filter to query params if not already present
  if (!req.query.company_id) {
    req.query.company_id = req.user.company_id;
  }

  next();
};

const buildCompanyFilterQuery = (baseQuery, tableAlias = '') => {
  const prefix = tableAlias ? `${tableAlias}.` : '';
  return `${baseQuery} WHERE ${prefix}company_id = $1`;
};

const buildCompanyJoinQuery = (baseQuery, joinTable, joinAlias = 'c') => {
  return `${baseQuery} WHERE ${joinAlias}.company_id = $1`;
};

module.exports = {
  addCompanyFilter,
  buildCompanyFilterQuery,
  buildCompanyJoinQuery
};