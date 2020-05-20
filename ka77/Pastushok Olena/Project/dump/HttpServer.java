package com.kpi.http;

import java.net.ServerSocket;
import java.net.Socket;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;

/**
 * The type Http server.
 */
public class HttpServer {

    private static class SocketProcessor implements Runnable {

        /**
         * The S.
         */
        public Socket s;
        /**
         * The Is.
         */
        public InputStream is;
        /**
         * The Os.
         */
        public OutputStream os;

        /**
         * Instantiates a new Socket processor.
         *
         * @param s the s
         * @throws Throwable the throwable
         */
        public SocketProcessor(Socket s) throws Throwable {
            this.s = s;
            this.is = s.getInputStream();
            this.os = s.getOutputStream();
        }

        public void run() {
            try {
                readInputHeaders();
                writeResponse("<html><body><h1>The project done: IASA 2020</h1></body></html>");
            } catch (Throwable t) {
            } finally {
                try {
                    s.close();
                } catch (Throwable t) {

                }
            }
            System.err.println("Client processing finished");
        }

        /**
         * Write response.
         *
         * @param s the s
         * @throws Throwable the throwable
         */
        public void writeResponse(String s) throws Throwable {
            String response = "HTTP/1.1 200 OK\r\n" +
                    "Server: YarServer/2009-09-09\r\n" +
                    "Content-Type: text/html\r\n" +
                    "Content-Length: " + s.length() + "\r\n" +
                    "Connection: close\r\n\r\n";
            String result = response + s;
            os.write(result.getBytes());
            os.flush();
        }

        /**
         * Read input headers.
         *
         * @throws Throwable the throwable
         */
        public void readInputHeaders() throws Throwable {
            BufferedReader br = new BufferedReader(new InputStreamReader(is));
            while(true) {
                String s = br.readLine();
                if(s == null || s.trim().length() == 0) {
                    break;
                }
            }
        }
    }

    /**
     * The entry point of application.
     *
     * @param args the input arguments
     * @throws Throwable the throwable
     */
    public static void main(String[] args) throws Throwable {
        ServerSocket ss = new ServerSocket(8080);
        while (true) {
            Socket s = ss.accept();
            System.err.println("Client accepted");
            new Thread(new SocketProcessor(s)).start();
        }
    }
}

