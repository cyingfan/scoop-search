import { default as axios } from 'axios';
import * as fs from 'fs';

type TreeNode = {
  path: string;
  type: string;
};

const getApiUrl = (user: string, repo: string) =>
  `https://api.github.com/repos/${user}/${repo}/git/trees/HEAD?recursive=1`;

const getJsonUrl = (user: string, repo: string, path: string) =>
  `https://raw.githubusercontent.com/${user}/${repo}/HEAD/${path}`;

axios
  .get('https://raw.githubusercontent.com/lukesampson/scoop/HEAD/buckets.json')
  .then((response) => response.data)
  .then((data: Object) => {
    const keys = Object.keys(data);
    keys.forEach((bucketName) => {
      const url = data[bucketName];
      const [user, repo] = url.split('/').slice(-2);
      axios.get(getApiUrl(user, repo)).then((response) => {
        response.data.tree.forEach((node: TreeNode) => {
          const match = node.path.match(/bucket\/([^\.]+)\.json$/);
          if (node.type === 'blob' && match?.length > 0) {
            axios.get(getJsonUrl(user, repo, node.path)).then((response) => {
              const json = response.data;
              json['bucket'] = bucketName;
              json['name'] = match[1];
              json['id'] = `${repo} - ${match[1]}`;
              fs.writeFile(`./data/raw/${json['id']}.json`, JSON.stringify(json), (err) => {
                if (err) {
                  console.error(err);
                }
              });
            });
          }
        });
      });
    });
  });
