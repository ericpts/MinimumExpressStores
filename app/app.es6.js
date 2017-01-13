import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const viewsPath = path.join(__dirname, 'views');

// Middleware used to parse request body

import bodyParser from "body-parser";

app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());

// ==================================

app.use('/', express.static(__dirname));

app.set('views', viewsPath);
app.set('view engine', 'html');

class Post {
    constructor(name, link) {
        this.name = name;
        this.link = link;
    }
}

// Don't do this at home
// just for demo purposes
class BadDatabase {
    constructor(filename) {
        this.file = filename;
        try {
            this.data = JSON.parse(fs.readFileSync(this.file));
        } catch (e) {
            this.data = {post: []};
        }
        this.lastId = this.data.post.length;
    }

    read(callback) {
        callback(this.data);
    }

    // Returns a State-like of the diffs
    add(store, object) {
        object.id = this.lastId + 1;
        this.data[store].push(object);
        this.save();

        this.lastId += 1;
        let ret = {};
        ret[store] = [object];
        return ret;
    }

    save() {
        fs.writeFile(this.file, JSON.stringify(this.data), (err) => {
            if (err)
                throw err;
            console.log("saved!");
        });
    }
}

let db = new BadDatabase('db.json');

app.get('/get_posts', (req, res) => {
    db.read((data) => {
        const ret = JSON.stringify(data);
        res.json(JSON.stringify(data));
    });
});

app.post('/add_post', (req, res) => {

    console.log(req.body);
    const postName = req.body.postName;
    const postLink = req.body.postLink;

    const ret = JSON.stringify(db.add('post', new Post(postName, postLink)));

    console.log(ret);

    res.json(ret);
});

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: viewsPath});
});

app.listen(8080, () => {
    console.log("Demo app up and running on port 8080");
});
