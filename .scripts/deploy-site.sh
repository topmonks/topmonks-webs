#!/usr/bin/env bash -evo pipefail

echo "Deploying site $1";

export AWS_PROFILE=topmonks;
pulumi stack select topmonks-webs;

distribution_id=$(pulumi stack output sites | jq -rM  '.["'"$1"'"] | .cloudFrontId | @text');

aws s3 sync "public/$1" "s3://$1";
aws cloudfront create-invalidation --distribution-id="$distribution_id" --paths="/*";
