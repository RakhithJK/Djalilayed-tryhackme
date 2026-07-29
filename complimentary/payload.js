AWS.config.credentials.get(function (err) {
  if (err) {
    console.error("Could not fetch guest credentials:", err);
    return;
  }

  const dynamodb = new AWS.DynamoDB({ region: "us-east-1" });
  dynamodb.scan(
    {
      TableName: "complimentary-GuestWellnessProfiles"
    },
    function (err, data) {
      if (err) {
        console.error("Could not load dashboard:", err);
        return;
      }
      console.log(data.Items);
    }
  );
});
