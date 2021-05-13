#!/usr/bin/env bash

echo "Deploying site $1";

AWS_PROFILE=topmonks pulumi stack select topmonks-webs;

distribution_id=$(AWS_PROFILE=topmonks pulumi stack output sites | jq -rM  '.["'"$1"'"] | .cloudFrontId | @text');

AWS_PROFILE=topmonks aws s3 sync "public/$1" "s3://$1";
AWS_PROFILE=topmonks aws cloudfront create-invalidation --distribution-id="$distribution_id" --paths=/*;
