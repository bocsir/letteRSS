# <img style="width: 35px" src="https://github.com/user-attachments/assets/507295c4-b8bd-4219-9bcf-f64849fe34d3"/> LetteRSS - RSS Reader
Minimal RSS reader

The goal of this project is to create an RSS reader that doesn't feel as busy as other readers.
Its built to show as little information at a time as possible.

A working beta is hosted on AWS at https://letterss.net

### Curent Features
  <ul>
    <li>Auth uses JWT for access and refresh tokens</li>
    <li>Users can add feeds by individual site link or with an .opml file</li>
    <li>Feeds can be deleted and their names can be edited</li>
    <li>Feeds can be filed into folders</li>
    <li>Feeds can be sorted</li>
    <li>Feeds can be read in-site or with an iframe to the original page</li>
  </ul>
  
### Future Features
  <ul>
    <li>Feed search</li>
    <li>Change theme / font</li>
    <li>Feed export</li>
    <li>Mobile app</li>
  </ul>

### Some Pics
![feed](https://github.com/user-attachments/assets/dcd64f72-ea5c-44e8-aa2d-98f6969d691e)
![new feed](https://github.com/user-attachments/assets/5378a07c-54eb-4861-b4de-b9458e66bbae)
![article](https://github.com/user-attachments/assets/e0faffd0-f88e-4d15-a2ac-5e2b31b4ff84)
![comic](https://github.com/user-attachments/assets/8a429084-1135-433b-8950-a69336519d0f)
![image](https://github.com/user-attachments/assets/489161b0-215d-4630-a1b4-512a18e19ee5)  

### Libraries / Middleware
<ul>
  <li><a href="https://github.com/axios/axios">Axios</a></li>
  <li><a href="https://github.com/auth0/node-jsonwebtoken">JWT</a></li>
  <li><a href="https://github.com/pyca/bcrypt">Bcrypt</a></li>
  <li><a href="https://github.com/expressjs/multer">Multer</a></li>
  <li><a href="https://github.com/scripting/opmlpackage">opml</a></li>
  <li><a href="https://github.com/rbren/rss-parser">RSS parser</a></li>
</ul>
