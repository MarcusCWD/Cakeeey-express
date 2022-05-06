const { Status } = require("../models");

async function allStatus() {
  return await Status.fetchAll().map((status) => {
    return [status.get("id"), status.get("status")];
  });
}

module.exports = {
  allStatus
};
