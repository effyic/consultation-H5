IMAGE_TAG=swr.cn-north-4.myhuaweicloud.com/registry-huawei/effyic/consultation-h5:latest

if [ "$1" == "prod" ]; then
  IMAGE_TAG=swr.cn-north-4.myhuaweicloud.com/registry-huawei/effyic/consultation-h5-hospital:latest
fi

docker build . --platform linux/amd64 -t $IMAGE_TAG
docker push $IMAGE_TAG
