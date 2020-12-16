import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Commit } from '../model/commit.model';
import { File } from '../model/file.model';
import { Observable } from 'rxjs';
import { Directory } from '../model/directory.model';
import { environment } from 'src/environments/environment';
import { ProjectQuery } from '../store/project/project.query';
import { GitStore } from '../store/git/git.store';
import { VisualizationService } from '../store/visualization/visualization.service';

export const COMMIT_ENDPOINT = 'commit';

@Injectable({
  providedIn: 'root'
})
export class CommitService {

  private projectId;

  constructor(
    private http: HttpClient,
    private projectQuery: ProjectQuery,
  ) {
    // Get id of active project
    projectQuery.selectActiveId().subscribe(id => {
      if (id != null) {
        this.projectId = id;
      }
    });
  }

  // Loads array of project files without preserving folder structure
  getFilesAtCommit(commit: Commit): Observable<File[]> {
    return this.http.get<File[]>(environment.apiUrl + '/project/' + this.projectId + '/' + COMMIT_ENDPOINT + '/' + commit.commitId + '/files');
  }

  // Loads project files while preserving folder structure
  getProjectFilesAtCommit(commit: Commit): Observable<Directory> {
    return this.http.get<Directory>(environment.apiUrl
      + `/project/${this.projectId}/` + COMMIT_ENDPOINT
      + '/' + commit.commitId);
  }
}
