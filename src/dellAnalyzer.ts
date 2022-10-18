import fs from 'fs';
import * as cheerio from 'cheerio';
import { Analyzer } from './crowller';

interface Course {
  title: string;
  count: number;
}
interface CourseResult {
  time: number;
  data: Course[];
}

interface Content {
  [propName: number]: Course[];
}

// 单例模式要求类不能被外部实例化
export default class DellAnalyzer implements Analyzer {
  private static instance: DellAnalyzer;
  static getInstance() {
    if (!DellAnalyzer.instance) {
      DellAnalyzer.instance = new DellAnalyzer();
    }
    return DellAnalyzer.instance;
  }

  private getCourseInfo(html: string) {
    const $ = cheerio.load(html);
    const courseItems = $('.course-item');
    const courseInfos: Course[] = [];
    if (courseItems.length) {
      courseItems.map((index, element) => {
        const descs = $(element).find('.course-desc');
        const title = descs.eq(0).text();
        const count = parseInt(descs.eq(1).text().split('：')[1]);
        courseInfos.push({
          title,
          count
        });
      });
    }
    return {
      time: new Date().getTime(),
      data: courseInfos
    };
  }

  private generateJsonContent(courseResult: CourseResult, filePath: string) {
    let fileContent: Content = {};
    if (fs.existsSync(filePath)) {
      fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    fileContent[courseResult.time] = courseResult.data;
    return fileContent;
  }

  public analyze(html: string, filePath: string) {
    const courseInfo = this.getCourseInfo(html);
    const fileContent = this.generateJsonContent(courseInfo, filePath);

    return JSON.stringify(fileContent);
  }

  private constructor() {
    // constructor 变成私有，就无法被外部实例化
  }
}
