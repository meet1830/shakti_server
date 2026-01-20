function getHealthStatus(req, res) {
  res.status(200).json({
    status: "active",
    message: "Instance is awake",
  });
}

export { getHealthStatus };
