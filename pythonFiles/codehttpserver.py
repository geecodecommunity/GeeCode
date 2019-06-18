from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import jedi
import sys

host = ('127.0.0.1', 34341)

attr_names = ["column", "name", "name_with_symbols", "type", "module_name", "module_path", "is_keyword",
              "complete", "full_name", "params","line","description","desc_with_module"]


class Resquest(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        data = {'result': 'this is a test'}
        self.wfile.write(json.dumps(data).encode())

    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        post_data_json = json.loads(post_data)

        # {text,line,column,filename}

        param_source_text = post_data_json['text']
        param_filename = post_data_json['filename']
        param_pos_line = post_data_json['pos_line']  # begin 1
        param_pos_column = post_data_json['pos_column']  # begin 0

        my_environment = jedi.api.environment.Environment(sys.executable)

        script = jedi.Script(param_source_text, param_pos_line, param_pos_column, param_filename,
                             environment=my_environment)

        if self.path.startswith("/goto_assignments"):
            assignments = script.goto_assignments()
            if len(assignments) > 10:
                assignments = assignments[0:10]

            assignments_arr = self._toDictList(assignments)
            assignments_str = json.dumps(assignments_arr)
            self.wfile.write(assignments_str.encode())

        if self.path.startswith("/completions"):
            completions = script.completions()
            if len(completions) > 10:
                completions = completions[0:10]
            completions_arr = self._toDictList(completions)
            completions_str = json.dumps(completions_arr)
            self.wfile.write(completions_str.encode())


    def _getObjValue(self,obj,attr_name):
        # attr_names = ["column", "name", "name_with_symbols", "type", "module_name", "module_path", "is_keyword",
        #               "complete", "full_name", "params"]
        if attr_name == "column":
            return obj.column
        if attr_name == "name":
            return obj.name
        if attr_name == "name_with_symbols":
            return obj.name_with_symbols
        if attr_name == "type":
            return obj.type
        if attr_name == "module_name":
            return obj.module_name
        if attr_name == "module_path":
            return obj.module_path
        if attr_name == "complete":
            return obj.complete
        if attr_name == "full_name":
            return obj.full_name
        if attr_name == "params":
            return obj.params
        if attr_name == "line":
            return obj.line
        if attr_name == "desc_with_module":
            return obj.desc_with_module
        if attr_name == "description":
            return obj.description


        return ""

    def _toDictObj(self, obj):
        dictObj = {}

        for attr_name in attr_names:
            if hasattr(obj, attr_name):
                attr_value = self._getObjValue(obj,attr_name)
                attr_value_type = type(attr_value)
                if attr_value_type == list:
                    dictObj[attr_name] = self._toDictList(attr_value)
                else:
                    dictObj[attr_name] = attr_value
        return dictObj

    def _toDictList(self, completions):
        try:
            result = []
            for comp in completions:
                dict_obj = self._toDictObj(comp)
                result.append(dict_obj)
            return result
        except:
            return []


if __name__ == '__main__':

    print("1==========")
    print(sys.exc_info())
    print("2==========")

    server = HTTPServer(host, Resquest)
    print("Starting server, listen at: %s:%s" % host)
    server.serve_forever()
    print()