# HoverboardJS
## A Tiny web application framework for single page applications.

+ [HoverboardJS](#about)
	+ [docs](#docs)
		+ [index](#index)
		+ [indexRoute](#indexroute)
		+ [main](#main)
		+ [endpoint](#endpoint)
		+ [base](#base)
		+ [set](#set)
		+ [notFound](#notfound)
		+ [request](#request)
		+ [public](#public)
		+ [start](#start)
		+ [Controllers](#controllers)
			+ [End](#end)
			+ [Header](#header)
			+ [Cookie](#cookie)
			+ [Status](#status)
			+ [Encoding](#encoding)
			+ [Write](#write)
			+ [Serve](#serve)
			+ [Message](#message)
			+ [Error](#error)
			+ [Field](#field)
			+ [Parameter](#parameter)
			+ [Fields](#fields)
			+ [Parameters](#parameters)
			+ [URL](#url)
			+ [Path](#path)
			+ [Cookies](#cookies)
			+ [Raw](#raw)

## About

HoverboardJS was created to provide a simple way to create single page web applications.

## Docs

### Constructor

```
const Hoverboard = require("hover-board");
const App        = new Hoverboard();
```

### base

This method sets the base directory for the application so you don't have to join the path for files with the ``__dirname`` every time.
Usage:

```
App.base(application_directory_path);
// For example, to use the current directory do:
App.base(__dirname);
```

### index

This method sets the index file for the app.
Usage:

```
App.index(path_to_index);
```

### indexRoute

This method creates a custom route that respondes with the index.
Usage:

```
App.indexRoute(route);
```

### main

This method adds a functional controller to the index page. Controllers are described below.
Usage:

```
App.main(controller_function);
```

### endpoint

This method creates an endpoint.
Usage:

```
App.endpoint(url_path,controller_function);
```

### set

This method alters the app configuration.
Usage:

```
App.set(property,value);
```

Config properties:

| Name          | Default Value   | Description           |
| ------------- | --------------- | --------------------- |
| `port`        | `5000`          | The HTTP Port.        |
| `https_port`  | `3000`          | The HTTPS Port.       |
| `host`        | `"127.0.0.1"`   | The host.             |
| `encrypted`   | `false`         | Whether to use HTTPS. |
| `tls_options` | `{}`            | HTTPS Options.        |

### notFound

This method sets the controller for the 404 error page. By default it uses HoverboardJS's 404 page.
Usage:

```
App.notFound(controller_function);
```

### request

This method is used by the library to process the HTTP requests but can also be used programmaticly to create serverless web applications.
Usage:

```
// path is the url path requested.
// method is the HTTP method.
// data is an object of the HTTP fields.
// headers is the request headers.
// protocol is either HTTP or HTTPS.
// full_path is the full path that was requested (Including the parameters).
// raw is the raw request body.
let my_request = App.request(path,method,data,headers,protocol,full_path,raw);
```

This method returns a promise with the results.
Promise usage:

```
my_request.then(results=>{
	// These are the results:
	/*
		{
			Headers  // The response headers.
			Status   // The response status code.
			Encoding // The response encoding.
			Message  // The response message.
			Body     // The response body.
		}
	*/
});
```

### public

This method makes a folder or a file public. Thus, making it accessible to the user.
Usage:

```
App.public(path_to_file_or_folder [, optional_url_path ]);
```

The url path is optional and when set will be the url path that will be used to access the folder or file. By default it is set to the file or folder name.

### start

This method starts the server.
Usage:

```
App.start();
```


### Controllers

Controllers are objects that control the state of the response. The first argument of each controller function is a response controller. That controller has methods to control the response. They are described below.

#### End

This method ends the response and sends it. What is passed to it will be written to the response body before ending it.
Usage:

```
c.End("Hello"," ",World");
```

#### Header

This method can either set a response header or return a request header.

To set a response header use:

```
c.Header("X-My-Header","My_Header_Value");
```

To get a request header use:

```
c.Header("Content-Type");
```

#### Cookie

This method can either set a cookie or get one.

To set a cookie use:

```
c.Cookie("MyCookieName","MyCookieValue" [,options]);
```

`options` is on object that can include the following properties:

| name       | description                                     | type(s)                      |
| ---------- | ----------------------------------------------- | ---------------------------- |
| `Expires`  | The date in which the cookie will expire.       | `Date` / `Number` / `String` |
| `MaxAge`   | The max age for the cookie.                     | `String` / `Number`          |
| `Domain`   | The domain for the cookie.                      | `String`                     |
| `Path`     | The path for the cookie.                        | `String`                     |
| `Secure`   | Specifies weather the cookie should be secured. | `Boolean`                    |
| `HttpOnly` | Sets the HTTP Cookie httpOnly attribute.        | `Boolean`                    |

#### Status

This method can either set or get the current response status code. If no arguments are passed it will return the current response status and if a number is passed it will make the status code that number.
Usage:

```
c.Status([,Status_Code]);
```

#### Encoding

This method can either set or get the response encoding. If no arguments are passed it will return the current response encoding and if a string is passed it will be made the new response encoding. Default is utf8. The supported encodings are:

| name      |
| --------- |
| `utf8`    |
| `ascii`   |
| `utf16le` |
| `ucs2`    |
| `base64`  |
| `latin1`  |
| `binary`  |
| `hex`     |

Read more at [https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings).

#### Write

This method writes to the response body.
Usage:

```
c.Write("Stuff","To","Write");
```

#### Serve

This method serves a file (Writes the contents of a file to the response body and sets the content type accordingly). It also allows simple templating.

To serve a file:

```
c.Serve(path_to_file);
```

The first argument is the path to the file.
The second argument specifies whether the path is full or should be joined with the base directory (By default the base will be joined).
To serve a file without joining the base use:

```
c.Serve(path_to_file,true);
```

The third argument is an array with the template variables. It will replace `#[var_name]` with `third_argument.var_name`. An example of templating:

```
c.Serve("message_page.html",false,{
	message:"This is my message"
});
```

message_page.html:

```
<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>#[message]</title>
	</head>
	<body>
		<h1>#[message]</h1>
	</body>
</html>
```

#### Message

This method can either set or get the current response message. If no arguments are passed it will return the current message. If a string is passed it will be made the new response message.
Usage:

```
c.Message([,message]);
```

#### Error

This method serves HoverboardJS's default error page. The first argument is the error code.
Usage:

```
c.Error(error_code);
// To serve the 404 error page:
c.Error(404);
```

#### Field

This method returns HTTP fields. To get a field by name, pass its name.
Usage:

```
c.Field(field_name);
```

#### Parameter

This method returns URL parameters. To get a parameter, pass its name.
Usage:

```
c.Parameter(parameter_name);
```

#### Fields

This property is an object of all of the HTTP fields.
Usage:

```
c.Fields;
```

#### Parameters

This property is an object of all the HTTP URL parameters.
Usage:

```
c.Parameters;
```

#### URL

This property is the full URL that was requested.
Usage:

```
c.URL;
```

#### Path

This property is the path that was requested.
Usage:

```
c.Path;
```

#### Cookies

This property is an object of all the cookies that came with the HTTP request.
Usage:

```
c.Cookies;
```

#### Raw

This property is the raw HTTP request body.
Usage:

```
c.Raw;
```
