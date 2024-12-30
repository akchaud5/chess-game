FROM python:3.11
RUN apt-get update && apt-get install -y stockfish
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]