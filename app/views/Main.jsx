import {UI, Button} from "UI";
import {StoreObject, GenericObjectStore} from "state/Store";
import {GlobalState} from "state/State";
import {Ajax} from "Ajax";
import {Form, TextInput, SubmitInput} from "Input";
import {Modal, ActionModalButton} from "Modal";


// This demo was desined to work with ExpressJS
// Which (currently) requires request data to be passed
// In JSON format
// So we add a preprocessor to modify any content into json
Ajax.fetch.defaultPreprocessors.push((options) => {
    if (options.method == "POST") {
        options.headers.set("Content-Type", "application/json");
        options.body = JSON.stringify(options.data);
    }
    return options;
});

class Post extends StoreObject {

}

const postStore = new GenericObjectStore("post", Post);

// Populate the store with the backend's database
Ajax.get({url: "get_posts/"})
    .then((response) => response.json())
    .then((json) => GlobalState.importState(JSON.parse(json)));

class Entry extends UI.Element {
    render() {
        const post = this.options.post;
        return [
            <a href={post.link}> {post.name} </a>
        ];
    }

    onMount() {
        this.attachUpdateListener(this.options.post, () => this.redraw());
    }
}

class EntryList extends UI.Element {
    setOptions(options) {
        super.setOptions(options);
    }

    render() {
        let entries = [];
        for (const post of postStore.all()) {
            const entry = <Entry
                post={post}
                key={post.id}
            />;
            entries.push(entry);
        }
        return entries;
    }

    onMount() {
        this.attachCreateListener(postStore, () => this.redraw());
    }
}

class NewPostForm extends Form {
    render() {
        return [
            <div>
                Link: 
                <TextInput ref="link"/>
            </div>,
            <div>
                Name: 
                <TextInput ref="name"/>
            </div>,
            <SubmitInput ref="submitButton" value="Submit"/>
        ];
    }

    getModal() {
        return this.options.modal;
    }

    onMount() {
        this.addNodeListener("submit", (event) => {
            event.preventDefault();

            const link = this.link.getValue();
            const name = this.name.getValue();

            let data = {
                postLink: link,
                postName: name,
            };

            Ajax.post({url: "add_post/", data: data})
                .then((response) => response.json())
                .then((json) => GlobalState.importState(JSON.parse(json)));

            this.getModal().hide();
        });
    }
}

class NewPostModal extends Modal {
    setOptions(options) {
        options.closeButton = true;
        super.setOptions(options);
    }

    getGivenChildren() {
        return <NewPostForm modal={this} />;
    }
}

class NewPostButton extends Button {
    setOptions(options) {
        options.label = options.label || "New post";
        super.setOptions(options);
    }

    getModal() {
        if (!this.modal)
            this.modal = <NewPostModal />;
        return this.modal;
    }

    onMount() {
        this.addClickListener(() => {
            this.getModal().show();
        });
    }
}

class MainWidget extends UI.Element {
    render() {
        return [<NewPostButton />,
                <EntryList/>];
    }

    newPost() {

    }
}

const mainElement = MainWidget.create(document.body);
