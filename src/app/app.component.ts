import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';
import * as https from 'https';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NgFor } from '@angular/common';

interface LinkData {
  url: string;
  depth: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})



export class AppComponent {
  title = 'SecondLab';
  public link1: string = "";
  public level: number = 0;
  public visited = new Set<string>();



  constructor() { }


  public onSubmited() {
    this.main(this.link1, this.level);
  }


  

  
  async getLinkedServers(
    startUrl: string,
    depth: number,
    visitedUrls: Set<string> = new Set()
  ): Promise<LinkData[]> {
    const links: LinkData[] = [];
  
    if (depth === 0 || visitedUrls.has(startUrl)) {
      return links;
    }
  
    visitedUrls.add(startUrl);
  
    try {
      const response = await axios.get(startUrl);
      const $ = cheerio.load(response.data);
  
      $('a[href]').each((_i, element) => {
        const href = $(element).attr('href');
        if (href) {
          const absoluteUrl = new URL(href, startUrl).toString();
          links.push({ url: absoluteUrl, depth: depth - 1 });
        }
      });
  
      for (const link of links) {
        const childLinks = await this.getLinkedServers(link.url, link.depth, new Set(visitedUrls));
        links.push(...childLinks);
      }
    } catch (error) {
      console.error(`Error fetching ${startUrl}: ${error}`);
    }
  
    return links;
  }
  
  async main(url:string,depth:number) {
    const startUrl = url; // Замените на ваш исходный сервер
    const maxDepth = depth; // Замените на вашу глубину поиска
  
    const linkedServers = await this.getLinkedServers(startUrl, maxDepth);
    
    linkedServers.forEach(item=>{if(item.url!=startUrl)this.visited.add(item.url)});
  
    console.log('Linked servers:');
    for (const link of linkedServers) {
      console.log(`- ${link.url} (Depth: ${link.depth})`);
    }
  }
  

  
  
}

