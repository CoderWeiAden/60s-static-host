import { parseArticleUrl, parseArticleUrlViaLLM } from '../legacy_src/core/parser.ts'

const url =
  'http://mp.weixin.qq.com/s?__biz=Mzg3NTQ0MjQwNg==&mid=2247495237&idx=1&sn=de2aeaa96ae0f93a4f1a63613fcf475d&chksm=cec3d7ccf9b45edaf29ae70ee59448ae21a9d42141ddba7f11354d30431b38a5b2f9c91cb9d0#rd'

console.log(await parseArticleUrl(url))
console.log(await parseArticleUrlViaLLM(url))
