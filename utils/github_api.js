import Octokat from "octokat";
import {stringToB64} from "@/utils/utils";
import {genRss} from "@/pages/backend/utils";

// github
export class GithubUtils {
  constructor(token, user, repo, committer) {
    this.octo = new Octokat({
      token: token,
      username: user,
    });
    this.repos = this.octo.repos(user, repo);
    this.committer = committer;
    this.login = user
  }

  verifyToken() {
    return new Promise(resolve => {
      this.octo.user.fetch().then(res => {
        resolve([true, res])
      }).catch(err => {
        resolve([false, err])
      })
    })
  }

  updateJsonFile(path, json) {
    path = `rebuild/json/${path}`;
    return new Promise(resolve => {
      this.repos.contents(path).fetch().then(res => {
        return this.repos.contents(path).add({
          message: `更新:${path}`,
          content: stringToB64(JSON.stringify(json, null, 4)),
          sha: res.sha,
          committer: this.committer
        }).then(res => {
          resolve([true, res])
        }).catch(err => {
          resolve([false, err])
        })
      }).catch(err => {
        resolve([false, err])
      })
    })
  }

  updateMd({file, content, mdList}, dict) {
    return this.createCommit([
      {
        folder: `rebuild/json/md.json`,
        content: JSON.stringify(mdList, null, 4)
      },
      {
        folder: `rebuild/md/${file}.md`,
        content: content
      },
      {
        folder: `static/rss.xml`,
        content: genRss(mdList)
      },
    ], `更新 md-${file}`, dict)
  };

  updateMdList({mdList}, dict) {
    return this.createCommit([
      {
        folder: `rebuild/json/md.json`,
        content: JSON.stringify(mdList, null, 4)
      },
      {
        folder: `static/rss.xml`,
        content: genRss(mdList)
      },
    ], `更新 mdList`, dict)
  };

  updateRecord({file, content, recordList}, dict) {
    return this.createCommit([
      {
        folder: `rebuild/json/record.json`,
        content: JSON.stringify(recordList, null, 4)
      },
      {
        folder: `rebuild/record/${file}.txt`,
        content: content
      }
    ], `更新 record-${file}`, dict)
  };

  updateTheme(scss, dict) {
    return this.createCommit([
        {
          folder: `rebuild/markdown.scss`,
          content: scss
        }
      ], `更新 theme`, dict)
  }

  // create commit
  createCommit(files, message, dict) {
    return new Promise(async resolve => {
      try {
        dict.state = '获取master的SHA';
        const main = await this.repos.git.refs('heads/master').fetch();
        // 创建tree
        const treeItems = [];
        for (const item of files) {
          dict.state = `创建blob:${item.folder.replace(/^.*\/([^/]*)$/, '$1')}`;
          const res = await this.repos.git.blobs.create({
            content: stringToB64(item.content),
            encoding: 'base64'
          });
          treeItems.push({
            path: item.folder,
            sha: res.sha,
            mode: "100644",
            type: "blob"
          });
        }
        dict.state = '创建tree';
        const tree = await this.repos.git.trees.create({
          tree: treeItems,
          base_tree: main.object.sha
        });

        // commit
        dict.state = 'commit...';
        const commit = await this.repos.git.commits.create({
          message: message,
          tree: tree.sha,
          parents: [main.object.sha]
        });
        dict.state = 'update...';
        await main.update({sha: commit.sha});
        resolve([tree])
      }catch (err){
        resolve([false, err])
      }
    })
  }

  removeSome(folders, dic, what) {
    return new Promise(async resolve => {
      try {
        const repo = this.repos;
        dic.state = '获取 commit sha';
        // 先获取master的commit sha
        let res = await repo.git.refs('heads/master').fetch();
        dic.state = '获取 tree sha';
        // 根据commit sha获取tree sha
        res = await repo.git.commits(res.object.sha).fetch();
        // 根据tree sha递归获取sha
        const originPath = ['rebuild', what];
        const mdPath = ['rebuild', what];

        async function getMdSha(treeSha) {
          if (mdPath.length) {
            dic.state = `获取 ${mdPath[0]} sha`;
            res = await repo.git.trees(treeSha).fetch();
            for (const t of res.tree) {
              if (t.type === 'tree' && t.path === mdPath[0]) {
                mdPath.splice(0, 1);
                return await getMdSha(t.sha)
              }
            }
          } else {
            // 找到了
            return await repo.git.trees(treeSha).fetch();
          }
        }

        res = await getMdSha(res.tree.sha);
        for (const i of res.tree) {
          if (folders.indexOf(i.path.replace('.txt', '').replace('.md', '')) !== -1) {
            dic.state = `删除 ${i.path}`;
            await repo.contents(`${originPath.join('/')}/${i.path}`).remove({
              sha: i.sha,
              message: '删除'
            });
          }
        }
        resolve([true])
      } catch (err) {
        resolve([false, err])
      }
    })
  }
}
