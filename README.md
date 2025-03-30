# Cluster Manager
This repository contains all relevant files for building the clustering web app and the corresponding backend service. This development is part of the _Process Mining in Celonis - Building Visualizations for Variant Clustering_ software lab of RWTH Aachen University and Celonis SE.

## Contributors
The project is developed and maintained by
- Tim Luca Reimers ([tim.reimers@rwth-aachen.de](mailto:tim.reimers@rwth-aachen.de))
- Ramanuj Sharma ([ramanuj.sharma@rwth-aachen.de](mailto:ramanuj.sharma@rwth-aachen.de))
- Philipp Bär ([philipp.baer@rwth-aachen.de](mailto:philipp.baer@rwth-aachen.de))

The project is supervised by
- Bob Luppes (Celonis SE) ([b.luppes@celonis.com](mailto:b.luppes@celonis.com))
- Alessandro Berti (RWTH Aachen University, PADS - Chair for computer science i9) ([a.berti@pads.rwth-aachen.de](mailto:a.berti@pads.rwth-aachen.de))

## About the Project
Within this project, we aim at developing a responsive web app that
- allows users to easily cluster their data set by means of the Celonis clustering techniques,
- visualize the result of the operation in an intuitive way,
- gain insides into the different clusters,
- manipulate, update, and export the clustering results.

## Getting Started

### Download and Install
You can either download the project as a .zip file or clone it via Git. We recommend to use Git to easily integrate updates of the code base. In any case, we now assume you are in the folder `variant-clustering` now. Moreover, you need to install
- Node.js with NPM (latest),
- Angular (latest, particularly make sure that the `ng` command is working), and
- python 3.x (tested with 3.9 on Windows and MacOS).

From now on, we assume you have open two terminals, both in the directory `YOUR_PATH_TO/variant-clustering`.

### Frontend
The web app is built with the Angular framework. To start the webserver, type the following in the first terminal:

    cd frontend

When first running the project, you need to download and install some dependencies. This is automatically done by typing:

    npm install

From now on, you usually need to type only:

    npm start

If errors occur, retry by using both `npm` commands instead.

You should now be able to visit `localhost:4200`.

### Backend
The backend consists of a REST-API interface and a Flask webserver connecting the API with the functional implementation. The entire backend is written in python.

To get startet, type the following in the second terminal:

    cd backend

Now you usually need to install many packages on your system. Start by installing `PyCelonis`:

    pip install --extra-index-url=https://pypi.celonis.cloud/ pycelonis==2.1.0

The other packages can be installed using

    pip install -r requirements.txt

Now you are good to go by typing

    python server.py

**Shapely and Descartes**

Depending on your OS and the package channel you use, you can face an error when calculating the clusters. You might want to check out [this](https://stackoverflow.com/a/75405557) post.

## Testing
This project is equipped with a series of tests. You can run these e.g. when making changes to the system. You might want to use the two terminals again, starting from `/frontend` and `/backend`.

### Frontend
The module tests, i.e. component tests for Angular written using Jasmine and Karma, are to be found in the files `*.spec.ts` in `frontend/src/app`. To execute all tests at once, type

    npm test

in the first terminal.

### Backend
The module tests, i.e. unit tests for Python written using the unittest package, are to be found in the folder `backend/tests`. You can execute a category of tests, i.e. one test file, at once starting with your second terminal in `backend` using

    cd tests
    python -m unittest -v TEST_FILE.py