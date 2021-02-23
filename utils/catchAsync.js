// takes the function of the route handler
module.exports = fn => {
  return (req, res, next) => {
    // I pass next to the catch block so express can handle the error
    fn(req, res, next).catch(next);
  };
};
